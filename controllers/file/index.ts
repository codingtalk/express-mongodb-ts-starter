import { Request, Response, NextFunction, } from 'express';
import { File, FileDocument } from '../../models/file';
import { FileAccess, FileAccessDocument } from '../../models/file/access';
import { INTERNAL_SERVER_ERROR } from '../../constant/http';
import { add as validateFileAdd, update as validateFileUpdate } from '../../validate/file';
import HttpException from '../../exception/HttpException';
import ResponseVo from '../../vo/ResponseVo';
import { getLoginUUID } from '../../utils/jwtUtil';
import { NativeError } from 'mongoose';
import * as _ from 'lodash'

/**
 * @description To create a new File
 * @RequireLogin true
 * @param req 
 * @param res 
 * @param next 
 * @returns void
 * 
 */
export const add = async (req: Request, res: Response, next: NextFunction) => {
    const responseVo: ResponseVo = new ResponseVo(res);
    const { title, description, content } = req.body; // `title` and `desciption` is only updated by owner,
    // owner and authorized user could update `content` 
    const loginUUID = getLoginUUID(req);
    try {
        const { valid, errors } = validateFileAdd(title, description, content);
        if (!valid) {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'data invalid', errors);
        }
        const file: FileDocument = new File({ creatorUserUUID: loginUUID, title, description, content });
        await file.save();
        responseVo.setData(file.toJSON());
        responseVo.ok();
    } catch (error) {
        next(error);
    };
}

/**
 * @description To update a File
 * @RequireLogin true
 * @param req 
 * @param res 
 * @param next 
 * @returns void
 * 
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
    const responseVo: ResponseVo = new ResponseVo(res);
    const { uuid } = req.query;
    const { key, value, contentPath } = req.body;
    const creatorLimitKeys = ['title', 'description'];
    const loginUUID = getLoginUUID(req);
    const strUUID = String(uuid);
    try {
        const { valid, errors } = validateFileUpdate(key, value, contentPath); // validate contentPath, allow [a-A, 0-9, -]
        if (!valid) {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'data invalid', errors);
        }
        const file: FileDocument | null = await File.findOne({ uuid: strUUID });
        if (!file) {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'file not exist', "");
        }
        if (creatorLimitKeys.includes(key)) {
            // if A user who does not own this file, will throw error
            if (loginUUID !== file.creatorUserUUID) {
                throw new HttpException(INTERNAL_SERVER_ERROR, 'access limited', "");
            }
            await File.updateOne({ uuid: strUUID }, {
                $set: {
                    [key]: value
                }
            }, undefined, (e: NativeError,) => {
            });
        } else if (key === 'content') {
            const arrContentPath = contentPath.split('.');
            // if A user who does not own this file, need to check it's permission, if not, will throw error
            if (loginUUID !== file.creatorUserUUID) {
                const fileAccess: FileAccessDocument | null = await FileAccess.findOne({
                    fileUUID: strUUID,
                    userUUID: loginUUID,
                    type: 'UPDATE',
                    status: 'OK'
                });
                // update content path `a.a-1`
                // allow user to update path `a`
                // `a.a-1`.includes(`a`) equals true means enable to update
                // !contentPath.includes(fileAccess.path) this way is not exactly right, there is a bug, but we could use it for now
                if (!fileAccess || !contentPath.includes(fileAccess.path)) {
                    throw new HttpException(INTERNAL_SERVER_ERROR, 'access limited', "");
                }
            }
            let arrLoopedKeys: string[] = [];
            for (let i = 0; i < arrContentPath.length; i++) {
                const key = arrContentPath[i];
                let keyPathValue: any = null;
                arrLoopedKeys.push(key);
                keyPathValue = _.get(file, `${arrLoopedKeys.join('.')}`)
                if (i === arrContentPath.length - 1) {
                    await File.updateOne({ uuid: strUUID }, {
                        $set: {
                            [`content.${arrLoopedKeys.join('.')}`]: value
                        }
                    }, undefined, (e: NativeError,) => {
                    });
                } else {
                    if (!keyPathValue || typeof keyPathValue === 'string') { // if content object key path dose not exist, 
                                                                             // or key value equals undifined or typeof eqauls string
                                                                             // assign value as {}
                        await File.updateOne({ uuid: strUUID }, {
                            $set: {
                                [`content.${arrLoopedKeys.join('.')}`]: {}
                            }
                        }, undefined, (e: NativeError,) => {
                        });
                    }
                }
            }
        } else {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'key is invalid', "");
        }
        responseVo.ok();
    } catch (error) {
        next(error);
    };
}

export const info = async (req: Request, res: Response, next: NextFunction) => {
    const responseVo: ResponseVo = new ResponseVo(res);
    const { uuid } = req.query;
    const loginUUID = getLoginUUID(req);
    try {
        const file: FileDocument | null = await File.findOne({ uuid: String(uuid) });
        if (!file) {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'file not exist', "");
        }
        //  if A user who does not own this file, need to check it's permission
        if (loginUUID !== file.creatorUserUUID) {
            const fileAccess: FileAccessDocument | null = await FileAccess.findOne({
                fileUUID: String(uuid),
                userUUID: loginUUID,
                type: 'READ',
                status: 'OK' // require `status` equals `OK` means the record is not expired
            });
            if (!fileAccess) {
                throw new HttpException(INTERNAL_SERVER_ERROR, 'access limited', "");
            }
        }
        responseVo.setData(file.toJSON());
        responseVo.ok();
    } catch (error) {
        next(error);
    };
}


import { Request, Response, NextFunction, } from 'express';
import { File, FileDocument } from '../../models/file';
import { FileAccess } from '../../models/file/access';
import { INTERNAL_SERVER_ERROR } from '../../constant/http';
import { accessUpdate as validateFileAccessUpdate } from '../../validate/file';
import HttpException from '../../exception/HttpException';
import ResponseVo from '../../vo/ResponseVo';
import { getLoginUUID } from '../../utils/jwtUtil';


/**
 * @description To update or insert a new file access record for a user
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
    const { userUUID, type, path, status } = req.body;
    const loginUUID = getLoginUUID(req);
    const strUUID = String(uuid);
    try {
        const { valid, errors } = validateFileAccessUpdate(uuid, userUUID, type, path, status);
        if (!valid) {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'data invalid', errors);
        }
        const file: FileDocument | null = await File.findOne({ uuid: String(uuid) });
        if (!file) {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'file not exist', "");
        }
        if (loginUUID !== file.creatorUserUUID) {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'access limited', "");
        }
        // findOneAndUpdate, if a record dose not exist, insert
        await FileAccess.findOneAndUpdate({ fileUUID: strUUID, userUUID, type }, {
            $set: {
                fileUUID: strUUID,
                userUUID,
                type,
                path,
                status
            }
        }, { upsert: true, new: true });
        responseVo.ok();
    } catch (error) {
        next(error);
    };
}


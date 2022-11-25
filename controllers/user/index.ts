import { Request, Response, NextFunction, } from 'express';
import { User, UserDocument } from '../../models/user';
import { INTERNAL_SERVER_ERROR } from '../../constant/http';
import { add as validateUserAdd } from '../../validate/user';
import HttpException from '../../exception/HttpException';
import ResponseVo from '../../vo/ResponseVo';
import { sign as jwtSign, getLoginUUID } from '../../utils/jwtUtil';
import bcryptjs from 'bcryptjs';

/**
 * @description User register
 * @RequireLogin false
 * @param req 
 * @param res 
 * @param next 
 * @returns void
 * 
 */
export const add = async (req: Request, res: Response, next: NextFunction) => {
    const responseVo: ResponseVo = new ResponseVo(res);
    const { username, password } = req.body; // username, user's login account
    try {
        const { valid, errors } = validateUserAdd(username, password);
        if (!valid) {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'data invalid', errors);
        }
        if (await User.findOne({ username })) {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'user exist', errors);
        }
        const user: UserDocument = new User({ username, password });
        await user.save();
        responseVo.ok();
    } catch (error) {
        next(error);
    };
}

/**
 * @description User login
 * @RequireLogin false
 * @param req 
 * @param res 
 * @param next 
 * @returns void
 * 
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const responseVo: ResponseVo = new ResponseVo(res);
    const { username, password } = req.body;
    try {
        const user: UserDocument | null = await User.findOne({ username });
        if (!user) {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'user not exist', "");
        }
        if (!bcryptjs.compareSync(password, user.password)) {
            throw new HttpException(INTERNAL_SERVER_ERROR, 'user password incorrect', "");
        }
        responseVo.setData(jwtSign(user.uuid));
        responseVo.ok();
    } catch (error) {
        next(error);
    };
}

/**
 * @description User info, this API nedd jwtToken, request-> headers-> jwt-token: xxx
 * @RequireLogin true
 * @param req 
 * @param res 
 * @param next 
 * @returns void
 * 
 */
export const info = async (req: Request, res: Response, next: NextFunction) => {
    const responseVo: ResponseVo = new ResponseVo(res);
    try {
        const user: UserDocument | null = await User.findOne({ uuid: getLoginUUID(req) })
        responseVo.setData(user?.toJSON());
        responseVo.ok();
    } catch (error) {
        next(error);
    };
}

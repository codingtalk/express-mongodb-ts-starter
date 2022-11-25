import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

const secretKey = 'test'

export const sign = (uuid: string): string => {
    return jwt.sign({
        uuid
    }, secretKey, { expiresIn: '72H' });

}

export const verify = (token: string): boolean => {
    try {
        return !!jwt.verify(token, secretKey);
    } catch (e) {
        return false;
    }
}

export const getLoginUUID = (_req: Request): string => {
    const jwtToken = _req.headers['jwt-token'];
    try {
        const jwtPayload: JwtPayload | string = jwt.verify(String(jwtToken), secretKey);
        return Object(jwtPayload).uuid;
    } catch (e) {
        console.log(e)
        return '';
    }
}
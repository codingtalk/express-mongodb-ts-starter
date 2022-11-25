import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED } from '../constant/http';
import { verify as jwtVerify } from '../utils/jwtUtil';


const authMiddleware = (_req: Request, res: Response, _next: NextFunction) => {
    const { url } = _req;
    const URLNotRequireLogin = ['/user/login', '/user/add'];
    if (URLNotRequireLogin.find(x => url.includes(x))) {
        _next();
    } else {
        const jwtToken = _req.headers['jwt-token'];
        if (jwtToken && jwtVerify(String(jwtToken))) {
            _next();
        } else {
            res.status(UNAUTHORIZED)
                .json({
                    success: false,
                    data: null,
                    msg: 'please login'
                });
        }
    }
}
export default authMiddleware;
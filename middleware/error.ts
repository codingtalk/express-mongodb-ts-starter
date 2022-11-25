import { Request, Response, NextFunction } from 'express';
import HttpException from '../exception/HttpException';
import { INTERNAL_SERVER_ERROR } from '../constant/http';
const errorMiddleware = (err: HttpException, _req: Request, res: Response, _next: NextFunction) => {
    const result: any = {
        success: false,
        message: err.message
    };
    if (err.errors && Object.keys(err.errors).length > 0) {
        result.errors = err.errors;
    }
    res.status(err.status || INTERNAL_SERVER_ERROR)
        .json(result);
}
export default errorMiddleware;
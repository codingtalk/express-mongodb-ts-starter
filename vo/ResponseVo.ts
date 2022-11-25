import { Response, } from 'express';

export default class ResponseVo {
    success = false;
    data = null;
    msg = 'opetation is ok';
    res = null;
    constructor(res: Response) {
        this.res = res;
    }

    setData(data: any) {
        this.data = data;
    }

    setMsg(msg: string) {
        this.msg = msg;
    }

    fail() {
        this.res.json({
            success: this.success,
            data: this.data,
            msg: this.msg
        });
    }

    ok() {
        this.success = true;
        this.res.json({
            success: this.success,
            data: this.data,
            msg: this.msg
        });
    }
}
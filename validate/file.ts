import { isValidStr } from '../utils/regUtil';

export const add = (title: string, description: string, content: string) => {
    let valid = true;
    let errors = '';
    return { valid, errors }
}

export const update = (key: string, value: string, contentPath: string) => {
    let valid = true;
    let errors = '';
    const arrContentPath = contentPath.split('.');
    for (let i in arrContentPath) {
        if (!isValidStr(arrContentPath[i])) {
            valid = false;
            errors = "invalid charset";
            break;
        }
    }
    return { valid, errors }
}

export const accessUpdate = (uuid: any, userUUID: string, type: string, path: string, status: string) => {
    let valid = true;
    let errors = '';
    const arrPath = path.split('.');
    for (let i in arrPath) {
        if (!isValidStr(arrPath[i])) {
            valid = false;
            errors = "invalid charset";
            break;
        }
    }
    return { valid, errors }
}
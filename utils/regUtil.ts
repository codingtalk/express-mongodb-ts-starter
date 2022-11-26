export const isValidStr = (s: string): boolean => {
    return !(/[^/a-zA-Z0-9\-]/g).test(s);
}
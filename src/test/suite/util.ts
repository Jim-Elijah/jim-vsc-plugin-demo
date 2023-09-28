export const add = (x: number, y: number) => {
    return x + y;
};

export const asyncAdd = (x: number, y: number) => {
    return Promise.resolve(x + y)
}
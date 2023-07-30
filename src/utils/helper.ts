import { Color } from "../types";

export const getFormatDateTime = (param?: Date | string | undefined) => {
    let date: Date;
    if (!param) {
        date = new Date();
    } else if (typeof param === "string") {
        date = new Date(param);
    } else {
        date = param;
    }
    if (date.toString() === "Invalid Date") {
        throw new Error(`${param} is not a date!`);
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const mills = date.getMilliseconds();
    return [year, "/", month, "/", day, " ", hour, ":", minute, ":", second, ".", mills].join("");
};

/**
 * @description judge if input is color
 * @param color color format string
 * @returns boolean
 */
export function isColor(color: any): boolean {
    let regEx = "";
    if (/^rgb\(/.test(color)) {
        //如果是rgb开头，200-249，250-255，0-199
        regEx =
            "^[rR][gG][Bb][(]([\\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)[\\s]*,){2}[\\s]*(2[0-4]\\d|25[0-5]|[01]?\\d\\d?)[\\s]*[)]{1}$";
    } else if (/^rgba\(/.test(color)) {
        //如果是rgba开头，判断0-255:200-249，250-255，0-199 判断0-1：0 1 1.0 0.0-0.9
        regEx =
            "^[rR][gG][Bb][Aa][(]([\\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)[\\s]*,){3}[\\s]*(1|1.0|0|0.[0-9])[\\s]*[)]{1}$";
    } else if (/^#/.test(color)) {
        //六位或者三位
        regEx = "^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$";
    } else if (/^hsl\(/.test(color)) {
        //判断0-360 判断0-100%(0可以没有百分号)
        regEx =
            "^[hH][Ss][Ll][(]([\\s]*(2[0-9][0-9]|360|3[0-5][0-9]|[01]?[0-9][0-9]?)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*)[)]$";
    } else if (/^hsla\(/.test(color)) {
        regEx =
            "^[hH][Ss][Ll][Aa][(]([\\s]*(2[0-9][0-9]|360|3[0-5][0-9]|[01]?[0-9][0-9]?)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*,){2}([\\s]*(1|1.0|0|0.[0-9])[\\s]*)[)]$";
    }
    if (!regEx) {
        return false;
    }
    const re = new RegExp(regEx);
    return re.test(color);
}

export const getNonce = () => {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

/**
 * @description 输出内容前面添加带颜色的时间
 * @param args 打印的内容
 * @return undefined
 */
export const logger = function (...args: any[]) {
    const last = args.pop();
    let color: Color;
    // 判断最后一个参数是否为color
    if (isColor(last)) {
        color = last;
    } else {
        args.push(last);
        // 默认的color
        color = "#008000";
    }
    console.log(`%c${getFormatDateTime()}`, `color: ${color}`, ...args);
};

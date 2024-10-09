import { ChildProcess, SpawnOptions, spawn, exec, ExecOptions } from "child_process";
import { Color } from "../types";
import EventEmitter = require("events");
import { isWin } from "./env";

export const bus = new EventEmitter();

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

export function sleep(delay: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, delay | 1000);
    });
}

export function interval(...args: any[]) {
    const [callback, delay = 0, ...rest] = args;
    // console.log('interval', callback, delay, rest);
    let timer: NodeJS.Timer | null;
    let cancelled = false;
    async function repeat() {
        if (!cancelled) {
            await callback(...rest);
            timer = setTimeout(repeat, delay);
        }
    }

    timer = setTimeout(repeat, delay);

    return () => {
        if (!timer) {
            console.log('timer has been cleared')
        } else {
            console.log('clear timer')
            cancelled = true;
            timer && clearTimeout(timer);
            timer = null;
        }
    };
}

export function promisifyExec(
    command: string,
    execOptions?: null | ExecOptions,
    // eslint-disable-next-line @typescript-eslint/ban-types
    callback?: (child: ChildProcess, resolve: Function, reject: Function) => void,
    options?: null | {
        encoding?: string;
        onStdout?: (childProcess: ChildProcess, data: string) => void;
        onStderr?: (childProcess: ChildProcess, data: string) => void;
        attachStderr?: boolean;
        hideStdout?: boolean;
    },
): Promise<{ stdout: string; stderr: string; code: number | null }> {
    if (!execOptions || !execOptions.shell) {
        execOptions = { ...(execOptions || {}), shell: isWin ? "powershell.exe" : "bash" };
    }

    return new Promise((resolve, reject) => {
        const childProcess = exec(command, execOptions || {});
        const { encoding = "utf-8", onStdout, onStderr, attachStderr, hideStdout } = options || {};
        let stdout = "";
        let stderr = "";
        let code: number | null = null;

        childProcess.stdout?.on("data", data => {
            const str = data.toString(encoding);
            if (!hideStdout) {
                console.log(`stdout ${new Date().toLocaleTimeString()}`, str);
            }
            if (typeof onStdout === "function") {
                onStdout(childProcess, str);
            }
            stdout += str;
        });

        childProcess.stderr?.on("data", data => {
            const str = data.toString(encoding);
            console.log(`stderr ${new Date().toLocaleTimeString()}`, str);
            if (typeof onStderr === "function") {
                onStderr(childProcess, str);
            }
            stderr += str;
        });

        childProcess.on("close", exitCode => {
            console.log("close", exitCode);
            code = exitCode;
            if (exitCode === 0) {
                resolve({ stdout, stderr, code });
                return;
            }
            if (attachStderr) {
                const error = new Error(`Exec ${command} Error. Process exited with code ${code}. Stderr: ${stderr} `);
                (error as any).stderr = stderr;
                (error as any).code = exitCode;
                reject(error);
                return;
            }
            const error = new Error(`Exec ${command} Error. Process exited with code ${code}.`);
            (error as any).code = exitCode;
            reject(error);
        });

        // 手动触发close，ssh连接服务器需要输入密码时
        if (typeof callback === "function") {
            callback(childProcess, resolve, reject);
        }

        childProcess.on("error", err => {
            reject(err);
        });
    });
}
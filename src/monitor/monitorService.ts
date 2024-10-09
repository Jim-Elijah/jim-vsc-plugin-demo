import * as _ from "lodash";
import * as fs from 'fs';
import { Client } from "ssh2";
import { ConnectionConfig, CPUInfo, MEMInfo, UsageInfo, UsageInfos } from "./types";
import { isWin } from "../utils/env";
import { interval, getFormatDateTime, promisifyExec } from "../utils/helper";

function log(...args: any[]) {
    console.log(args)
}

function getSSHClient({
    host,
    port,
    username,
    password,
    name,
    timeout = 8000,
    privateKeyPath = "",
    keepaliveInterval,
    keepaliveCountMax,
    readyTimeout,
}: {
    host: string,
    port: number,
    username: string,
    password?: string,
    name?: string,
    timeout?: number,
    privateKeyPath?: string,
    keepaliveInterval?: number,
    keepaliveCountMax?: number,
    readyTimeout?: number,

}): Promise<Client> {
    const conn = new Client();
    // eslint-disable-next-line prefer-const
    if (!readyTimeout) {
        readyTimeout = timeout;
    }
    return new Promise<Client>((resolve, reject) => {
        conn.on("error", (err: any) => {
            conn.end(); // 关闭连接
            console.error("ssh connection error:", err);

            reject(err); // 连接失败
        });
        conn.on("ready", () => {
            resolve(conn); // 连接成功
        });
        conn.connect({
            host,
            port,
            username,
            password,
            timeout,
            privateKey: privateKeyPath ? fs.readFileSync(privateKeyPath) : "",
            keepaliveInterval,
            keepaliveCountMax,
            readyTimeout,
        });
    });
}



export const executeCommand = (
    conn: Client,
    command: string,
): Promise<{ output: string; exitCode: number; stderr: string }> => {
    return new Promise((resolve, reject) => {
        conn.exec(command, (err, stream) => {
            console.log(`正在执行指令 ${command}`);
            if (err) {
                log(`执行指令${command}发生错误`, err);
                reject(err);
                return;
            }

            let result = "";
            let stderr = "";
            stream.on("data", (data: Buffer) => {
                result += data.toString();
            });
            stream.on("close", (exitCode: number) => {
                resolve({ output: result, exitCode, stderr });
            });
            stream.stderr.on("data", err => {
                stderr += err.toString();
            });
        });
    });
};

const globalObj: any = {}

class ConnectService {
    // 轮换时间
    private defaultInterval: number = 5 * 1000;
    // 最大数据量
    private defaultMaxNum = 30;
    // 超时时间
    private defaultTimeout: number = 8 * 1000;
    private defaultReadyTimeout: number = 10 * 1000;
    private defaultKeepaliveInterval: number = 2 * 1000;
    private defaultKeepaliveCountMax = 3;
    // private isDisconnected: boolean | undefined = undefined;
    config: ConnectionConfig;
    options: any;
    usageInfos: UsageInfos | undefined;
    // eslint-disable-next-line @typescript-eslint/ban-types
    clearTimerFn: Function | null = null;
    client: Client | null = null;
    constructor(config: ConnectionConfig, options?: any) {
        this.config = config;
        this.options = options;
        // if (_.isFunction(this.config.onInitData)) {
        //     this.usageInfos = this.config.onInitData();
        // }
    }
    async getPerfsPoll() {
        await this.getPerfs();
        // eslint-disable-next-line @typescript-eslint/ban-types
        globalObj.clearTimerFn = this.clearTimerFn = interval(async () => {
            await this.getPerfs();
        }, this.config.interval || this.defaultInterval);
        // if (typeof this.config.onFirstPoll === "function") {
        //     this.config.onFirstPoll(this.clearTimerFn);
        // }
    }
    async getPerfs() {
        if (!(this.config.local || this.config.remote)) {
            return;
        }
        if (this.config.local) {
            return await this.getLocalPerfs();
        }
        return await this.getRemotePerfs();
    }
    async getLocalPerfs() {
        const finalCmd = "top -n 1 -b | head";
        const finalTimeout = this.config?.local?.timeout || this.defaultTimeout;
        const ts = getFormatDateTime();
        try {
            const res = await promisifyExec(
                finalCmd,
                { shell: isWin ? "powershell.exe" : "bash" },
                (childProcess, resolve, reject) => {
                    if (finalTimeout) {
                        setTimeout(() => {
                            reject("执行top超时");
                        }, finalTimeout);
                    }
                },
            );
            const usageInfos = this.parseOutput(res.stdout, ts);
            if (typeof this.config.onUpdate === "function" && usageInfos) {
                await this.config.onUpdate(usageInfos);
            }
        } catch (e) {
            console.log(`${finalCmd} error`, e);
            return;
        }
    }
    async getRemotePerfs() {
        if (!this.config.remote) {
            return;
        }
        const { host, port, username, password, privateKeyPath, timeout, keepaliveInterval, keepaliveCountMax, readyTimeout } = this.config.remote;
        const finalCmd = "top -n 1 -b | head";
        const finalTimeout = timeout || this.defaultTimeout;
        const finalKeepaliveInterval = keepaliveInterval || this.defaultKeepaliveInterval;
        const finalKeepaliveCountMax = keepaliveCountMax || this.defaultKeepaliveCountMax;
        const finalReadyTimeout = readyTimeout || this.defaultReadyTimeout;
        // 修复 Permissions are too open
        if (!isWin) {
            await promisifyExec(`chmod 600 ${privateKeyPath}`);
        }
        const ts = getFormatDateTime();
        try {
            if (!this.client) {
                // if (this.isDisconnected) {
                //     return;
                // }
                this.client = await getSSHClient({
                    host,
                    port,
                    username,
                    password,
                    name: username,
                    timeout: finalTimeout,
                    privateKeyPath,
                    keepaliveInterval: finalKeepaliveInterval,
                    keepaliveCountMax: finalKeepaliveCountMax,
                    readyTimeout: finalReadyTimeout
                });
                this.client.on("error", (e) => {
                    console.log(`【monitor】connection to ${JSON.stringify(this.config.remote)} error`, e);
                    this.handleDisconnect();
                });
                this.client.on("end", () => {
                    console.log(`【monitor】connection to ${JSON.stringify(this.config.remote)} end`);
                    this.handleDisconnect();
                });
            }
            if (_.isFunction(this.config.onConnect)) {
                // this.config.onConnect(this.clearTimerFn);
            }
            const res = await executeCommand(this.client, finalCmd);
            console.log(`res of exec ${finalCmd}`, res);
            const usageInfos = this.parseOutput(res.output, ts);
            if (this.config.onUpdate && _.isFunction(this.config.onUpdate) && usageInfos) {
                await this.config.onUpdate(usageInfos);
            }
        } catch (e) {
            console.log(`${finalCmd} error`, e);
            this.handleDisconnect();
            return;
        }
    }
    handleDisconnect() {
        if (this.clearTimerFn && _.isFunction(this.clearTimerFn)) {
            this.clearTimerFn();
            this.clearTimerFn = null;
        }
        if (this.config.onDisconnect && _.isFunction(this.config.onDisconnect)) {
            this.config.onDisconnect();
        }
        if (this.client) {
            this.client.end();
            this.client = null;
        }
        // this.isDisconnected = true;
    }
    parseOutput(stdout: string, ts: string): UsageInfos | undefined {
        const stats = this.parseTopOutput(stdout);
        console.log("stats", stats);
        if (!stats) {
            return;
        }
        let { cpuInfos = [], memInfos = [] } = this.usageInfos || {};
        cpuInfos.push({ ...stats.cpuInfo, ts });
        memInfos.push({ ...stats.memInfo, ts });
        // 截取最后maxNum个
        const maxMum = this.defaultMaxNum;
        cpuInfos = cpuInfos.slice(-maxMum);
        memInfos = memInfos.slice(-maxMum);
        this.usageInfos = {
            cpuInfos,
            memInfos,
        };
        return this.usageInfos;
    }
    parseTopOutput(output: string): UsageInfo | null {
        const lines = output.split("\n");
        const cpuLine = lines.find(line => line.match(/^%Cpu\(s\)/));
        const memLine = lines.find(line => line.match(/^(M|K)iB Mem/));

        console.log("matchLine", cpuLine, memLine);
        if (!cpuLine || !memLine) {
            return null;
        }
        const cpuMatch = cpuLine.match(/(\d+\.\d+)\s*us,\s*(\d+\.\d+)\s*sy,\s*(\d+\.\d+)\s*ni,\s*(\d+\.\d+)\s*id/);
        const memMatch = memLine.match(/(\d+\.\d+)\s*total,\s*(\d+\.\d+)\s*free,\s*(\d+\.\d+)\s*used/);
        console.log("matchInfo", cpuMatch, memMatch);
        if (cpuMatch && cpuMatch.length > 4 && memMatch && memMatch.length > 3) {
            const cpuInfo: CPUInfo = {
                user: parseFloat(cpuMatch[1]),
                system: parseFloat(cpuMatch[2]),
                idle: parseFloat(cpuMatch[4]),
            };
            const memInfo: MEMInfo = {
                total: parseFloat(memMatch[1]),
                used: parseFloat(memMatch[3]),
                free: parseFloat(memMatch[2]),
            };
            return { cpuInfo, memInfo };
        }
        return null;
    }
}

export default class MonitorService {
    static async getPerfs(config: ConnectionConfig) {
        const instance = new ConnectService(config);
        return await instance.getPerfsPoll();
    }
}

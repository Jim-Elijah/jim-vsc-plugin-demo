export enum OSType {
    "Windows",
    "Linux",
    "macOS",
}
export interface RemoteConnectionConfig {
    host: string;
    port: number;
    username: string;
    password?: string;
    // remote的OS类型
    osType?: OSType;
    // 私钥路径
    privateKeyPath?: string;
    // 连接超时时间
    timeout?: number;
    readyTimeout?: number;
    keepaliveInterval?: number;
    keepaliveCountMax?: number,
}
export interface LocalConnectionConfig {
    // 连接超时时间
    timeout?: number;
}
export interface ConnectionConfig {
    local?: LocalConnectionConfig;
    remote?: RemoteConnectionConfig;
    // 轮询间隔
    interval?: number;
    // 获取到perfs执行的回调
    onUpdate?: (...args: any[]) => any;
    // // 保存clearTimerFn，用于清除轮询
    // onFirstPoll?: Function;
    // 初始化perfs
    onInitData?:  (...args: any[]) => any;
    onConnect?:  (...args: any[]) => any;
    onDisconnect?:  (...args: any[]) => any;
}
export interface CPUInfo {
    user: number;
    system: number;
    idle: number;
    ts?: string;
}
export interface MEMInfo {
    total: number;
    used: number;
    free: number;
    ts?: string;
}

export interface UsageInfo {
    cpuInfo: CPUInfo;
    memInfo: MEMInfo;
}
export interface UsageInfos {
    cpuInfos: Array<CPUInfo>;
    memInfos: Array<MEMInfo>;
}

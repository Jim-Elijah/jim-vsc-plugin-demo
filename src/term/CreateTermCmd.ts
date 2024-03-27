import * as vscode from "vscode";
import * as os from "os";
import { ChildProcess, spawn } from "child_process";

export default class CreateTermCmd implements vscode.Pseudoterminal {
    private writeEmitter = new vscode.EventEmitter<string>();
    onDidWrite: vscode.Event<string> = this.writeEmitter.event;

    private closeEmitter = new vscode.EventEmitter<number>();
    onDidClose: vscode.Event<number> = this.closeEmitter.event;

    private shellProcess: ChildProcess | null = null;
    private cwd: string;
    private termData = "";
    private welcomeInfo = `welcome to terminal of ultrarisc-ide`;
    private highlightInfo: string;
    private writeHasEnd = false;

    constructor(cwd?: string) {
        this.cwd = cwd || "";
        this.highlightInfo = `zoujinqiang ${this.cwd}`;
    }

    // formatText(text: string) { return `\r${text.split(/(\r?\n)/g).join("\r")}\r`; }


    // 参考git bash格式，userName@desktop path branch
    showTip() {
        this.writeEmitter.fire(`${this.highlightInfo}\r\n$ `);
        this.termData = "";
    }
    genChildProcess() {
        // 创建子进程
        this.shellProcess = spawn(os.platform() === "win32" ? "powershell.exe" : "bash", [], {
            cwd: this.cwd,
            env: process.env,
        });
        this.shellProcess?.stdin?.end(this.termData);
        // 监听子进程的数据事件
        this.shellProcess?.stdout?.on("data", data => {
            console.log("stdout on data", data.toString());
            this.showCmdRes(data.toString());
            this.showTip();
        });

        // 监听子进程的错误事件
        this.shellProcess?.stderr?.on("data", data => {
            console.log("stderr on data", data.toString());
            this.showCmdRes(data.toString());
            this.showTip();
        });

        // 监听子进程的退出事件
        // this.shellProcess.on("exit", exitCode => {
        //     console.log("on exit", exitCode);
        //     // this.closeEmitter.fire(Number(exitCode));
        //     // 退出出现异常
        //     if (exitCode) {
        //         this.showCmdRes(exitCode);
        //         this.showTip();
        //     }
        // });
    }
    showCmdRes(str: any) {
        this.writeEmitter.fire(`${str}\r\n`);
    }
    open(initialDimensions: vscode.TerminalDimensions | undefined): void {
        console.log("open", this.cwd);
        this.writeEmitter.fire(`${this.welcomeInfo}\r\n\r\n`);
        this.showTip();
        // this.genChildProcess();
    }

    close(): void {
        console.log('close');
        if (this.shellProcess) {
            // 终止子进程
            this.shellProcess.kill();
        }
    }

    handleInput(data: string): void {
        // if (this.writeHasEnd) {
        //     this.genChildProcess();
        //     this.writeHasEnd = false;
        // }
        // Enter
        if (data === "\r") {
            if (!this.termData.trim()) {
                this.writeEmitter.fire("\r\n\r\n");
                this.showTip();
                return;
            }
            // this.writeEmitter.fire(`\r\necho: "${colorText(this.termData)}"\r\n\n`);
            // this.writeEmitter.fire(`\r\n${this.termData}\r\n\n`);
            // this.writeHasEnd = true;
            this.writeEmitter.fire("\r\n");
            // 让子进程执行
            this.genChildProcess();
            return;
        }
        // Backspace
        if (data === "\x7f") {
            if (!this.termData.length) {
                return;
            }
            this.termData = this.termData.substring(0, this.termData.length - 1);
            // Move cursor backward
            this.writeEmitter.fire("\x1b[D");
            // Delete character
            this.writeEmitter.fire("\x1b[P");
            return;
        }
        this.termData += data;
        this.writeEmitter.fire(data);
    }
}

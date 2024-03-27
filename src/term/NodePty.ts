

import * as PTY from 'node-pty';
import * as os from 'os';
import * as vscode from "vscode";
import { ChildProcess, SpawnOptions, execSync, spawn, exec, ExecOptions } from "child_process";
import { promisify } from "util";

// https://github.com/ShMcK/vscode-pseudoterminal/blob/master/src/extension.ts#L28

// promisified Node executable (Node 10+)
// const exec = promisify(cpExec);

// Settings
const defaultLine = "→ ";
const keys = {
    enter: "\r",
    backspace: "\x7f",
};
const actions = {
    cursorBack: "\x1b[D",
    deleteChar: "\x1b[P",
    clear: "\x1b[2J\x1b[3J\x1b[;H",
};

const bash = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

// cleanup inconsitent line breaks
const formatText = (text: string) => `\r${text.split(/(\r?\n)/g).join("\r")}\r`;


function promisifySpawn(
    command: string,
    args?: any[],
    spawnOptions?: null | SpawnOptions,
    callback?: (child: ChildProcess) => void,
    options?: null | { encoding?: string; onStdout?: (data: string) => void; onStderr?: (data: string) => void },
): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args || [], spawnOptions || {});
        const { encoding = "utf-8", onStdout, onStderr } = options || {};
        let stdout = "";
        let stderr = "";

        childProcess.stdout!.on("data", data => {
            const str = data.toString(encoding);
            console.log(`stdout ${new Date().toLocaleTimeString()}`, str);
            if (typeof onStdout === "function") {
                onStdout(str);
            }
            stdout += str;
        });

        childProcess.stderr!.on("data", data => {
            const str = data.toString(encoding);
            console.log(`stderr ${new Date().toLocaleTimeString()}`, str);
            if (typeof onStderr === "function") {
                onStderr(str);
            }
            stderr += str;
        });

        childProcess.on("close", code => {
            console.log("close", code);
            if (code === 0 || code === 255) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`Spawn ${command} ${args!.join(" ")} Error. Process exited with code ${code}`));
            }
        });

        // 手动触发close，ssh连接服务器需要输入密码时
        if (typeof callback === "function") {
            callback(childProcess);
        }

        childProcess.on("error", err => {
            reject(err);
        });
    });
}

function promisifyExec(
    command: string,
    execOptions?: null | ExecOptions,
    callback?: (child: ChildProcess) => void,
    options?: null | { encoding?: string; onStdout?: (childProcess: ChildProcess, data: string) => void; onStderr?: (childProcess: ChildProcess, data: string) => void },
): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        const childProcess = exec(command, execOptions || {});
        const { encoding = "utf-8", onStdout, onStderr } = options || {};
        let stdout = "";
        let stderr = "";

        childProcess.stdout!.on("data", data => {
            const str = data.toString(encoding);
            console.log(`stdout ${new Date().toLocaleTimeString()}`, str);
            if (typeof onStdout === "function") {
                onStdout(childProcess, str);
            }
            stdout += str;
        });

        childProcess.stderr!.on("data", data => {
            const str = data.toString(encoding);
            console.log(`stderr ${new Date().toLocaleTimeString()}`, str);
            if (typeof onStderr === "function") {
                onStderr(childProcess, str);
            }
            stderr += str;
        });

        childProcess.on("close", code => {
            console.log("close", code);
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`Exec ${command} Error. Process exited with code ${code}`));
            }
        });

        // 手动触发close，ssh连接服务器需要输入密码时
        if (typeof callback === "function") {
            callback(childProcess);
        }

        childProcess.on("error", err => {
            reject(err);
        });
    });
}


// export default class NodePty {
//     public writeEmitter = new vscode.EventEmitter<string>();
//     public context: vscode.ExtensionContext;
//     public terminal: vscode.Terminal | null = null;
//     constructor(context: vscode.ExtensionContext) {
//         this.context = context;
//         let content = defaultLine;
//         const pty = {
//             onDidWrite: this.writeEmitter.event,
//             open: () => { console.log('open'); this.writeEmitter.fire(content); },
//             close: () => {
//                 console.log('close');
//             },
//             handleInput: async (char: string) => {
//                 console.log('input', char);
//                 switch (char) {
//                     case keys.enter:
//                         // preserve the run command line for history
//                         this.writeEmitter.fire(`\r${content}\r\n`);
//                         // trim off leading default prompt
//                         const command = content.slice(defaultLine.length);
//                         try {
//                             // run the command
//                             const { stdout, stderr } = await promisifyExec(command);

//                             if (stdout) {
//                                 this.writeEmitter.fire(formatText(stdout));
//                             }

//                             if (stderr && stderr.length) {
//                                 this.writeEmitter.fire(formatText(stderr));
//                             }
//                         } catch (error: any) {
//                             this.writeEmitter.fire(`\r${formatText(error.message)}`);
//                         }
//                         content = defaultLine;
//                         this.writeEmitter.fire(`\r${content}`);
//                     case keys.backspace:
//                         if (content.length <= defaultLine.length) {
//                             return;
//                         }
//                         // remove last character
//                         content = content.substr(0, content.length - 1);
//                         this.writeEmitter.fire(actions.cursorBack);
//                         this.writeEmitter.fire(actions.deleteChar);
//                         return;
//                     default:
//                         // typing a new character
//                         content += char;
//                         this.writeEmitter.fire(char);
//                 }
//             },
//         };
//         this.terminal = vscode.window.createTerminal({
//             name: `PseudoTerminal Demo`,
//             pty,
//         });
//         console.log('this.terminal', this.terminal);

//         this.terminal.show();
//         this.terminal.sendText('pwd', true)
//         // this.terminal.sendText('whoami')
//     }
//     clear() {
//         console.log('clear');
//         this.writeEmitter.fire(actions.clear);
//     }
// }


export default class NodePty {
    shell: PTY.IPty;
    constructor(context: vscode.ExtensionContext) {

        const shell = PTY.spawn(bash, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.cwd(),
            env: process.env
        });
        this.shell = shell;

        shell.onData(data => {
            // 处理从子进程发送的输出
            console.log('ondata', data);
            console.log(data);
        });

        shell.onExit(() => {
            // PTY 会话已关闭
            console.log('shell exit');
        })

        // 处理终端窗口大小变化
        process.stdout.on('resize', () => {
            const { columns, rows } = process.stdout;
            console.log('resize', columns, rows);
            shell.resize(columns, rows);
        });

        // 处理输入
        process.stdin.on('data', data => {
            // 将父进程的stdin写入子进程的stdin
            console.log('write', data, data.toString());
            shell.write(data.toString());
        });
        process.on('SIGINT', this.closePty);
        process.on('SIGTERM', this.closePty);
    }

    // 关闭 PTY 会话
    closePty() {
        console.log('closePty');
        this.shell.kill();
    }
}
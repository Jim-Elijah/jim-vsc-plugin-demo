import * as vscode from "vscode";
import { exec as cpExec } from "child_process";
import { promisify } from "util";

// https://github.com/ShMcK/vscode-pseudoterminal/blob/master/src/extension.ts#L28

// promisified Node executable (Node 10+)
const exec = promisify(cpExec);

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

// cleanup inconsitent line breaks
const formatText = (text: string) => `\r${text.split(/(\r?\n)/g).join("\r")}\r`;


class Pty {
    public writeEmitter = new vscode.EventEmitter<string>();
    public context: vscode.ExtensionContext;
    public terminal: vscode.Terminal | null = null;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }
    create() {
        console.log('create');
        // content
        let content = defaultLine;

        // handle workspaces
        const workspaceRoots: readonly vscode.WorkspaceFolder[] | undefined =
            vscode.workspace.workspaceFolders;
        if (!workspaceRoots || !workspaceRoots.length) {
            // no workspace root
            return "";
        }
        const workspaceRoot: string = workspaceRoots[0].uri.fsPath || "";

        const pty = {
            onDidWrite: this.writeEmitter.event,
            open: () => { console.log('open'); this.writeEmitter.fire(content);},
            close: () => {
                console.log('close');
            },
            handleInput: async (char: string) => {
                console.log('input', char);
                switch (char) {
                    case keys.enter:
                        // preserve the run command line for history
                        this.writeEmitter.fire(`\r${content}\r\n`);
                        // trim off leading default prompt
                        const command = content.slice(defaultLine.length);
                        try {
                            // run the command
                            const { stdout, stderr } = await exec(command, {
                                encoding: "utf8",
                                cwd: workspaceRoot,
                            });

                            if (stdout) {
                                this.writeEmitter.fire(formatText(stdout));
                            }

                            if (stderr && stderr.length) {
                                this.writeEmitter.fire(formatText(stderr));
                            }
                        } catch (error: any) {
                            this.writeEmitter.fire(`\r${formatText(error.message)}`);
                        }
                        content = defaultLine;
                        this.writeEmitter.fire(`\r${content}`);
                    case keys.backspace:
                        if (content.length <= defaultLine.length) {
                            return;
                        }
                        // remove last character
                        content = content.substr(0, content.length - 1);
                        this.writeEmitter.fire(actions.cursorBack);
                        this.writeEmitter.fire(actions.deleteChar);
                        return;
                    default:
                        // typing a new character
                        content += char;
                        this.writeEmitter.fire(char);
                }
            },
        };
        this.terminal = vscode.window.createTerminal({
            name: `PseudoTerminal Demo`,
            pty,
        });
        this.terminal.show();
    }
    clear() {
        console.log('clear');
        this.writeEmitter.fire(actions.clear);
    }
}

export default class PtyWrapper {
   constructor(context: vscode.ExtensionContext) {
    const pty = new Pty(context);
    context.subscriptions.push(
        vscode.commands.registerCommand("jim-vsc-plugin-demo.create", () => {
            pty.create();
        })
      );
    context.subscriptions.push(
        vscode.commands.registerCommand("jim-vsc-plugin-demo.clear", () => {
            pty.clear();
        })
      );
   }
}
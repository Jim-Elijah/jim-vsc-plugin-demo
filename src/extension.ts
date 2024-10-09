import * as vscode from 'vscode';
// import Movies from "./webviews/WebviewMovieList";
// import News from './webviews/WebviewNewsList';
// import UseBrowserLiteCmd from './commands/UseBrowserLiteCmd';
// import Pty from './term/Pty';
// import NodePty from './term/NodePty';

// import CreateTermCmd from './term/CreateTermCmd';
// import OutputChannel from './output/OutputChannel';
// import { activate as activateTreeView } from './treeViews/treeviewProvider';
// import { EchoTaskProvider } from "./echoTaskProvider";
import OrdersProvider from "./treeViews/Orders"
import ResouceUsage from './webviews/ResouceUsage';
import MonitorService from './monitor/monitorService';
import SQLiteDB, { GlobalState } from './utils/db';

export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('jim-vsc-plugin-demo.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from jim-vsc-plugin-demo!');
		console.log('command jim-vsc-plugin-demo.helloWorld triggered!');
	}));


	const connection = GlobalState.getInstance()
	// console.log('connection', connection)
	console.log('read', await connection.read())
	// await connection.update("user", { name: 'zs' })
	// console.log('read', await connection.read())



	// new OrdersProvider(context)
	// new ResouceUsage(context)

	// const DEFAULT_ACCOUNT = {
	// 	username: "root",
	// 	password: "riscv",
	// };
	// const host = "192.168.253.220"
	// const sshPort = 2223
	// const timeout = 8 * 1000;

	// const connectionConfig = {
	// 	remote: {
	// 		host,
	// 		port: sshPort,
	// 		username: DEFAULT_ACCOUNT.username,
	// 		password: DEFAULT_ACCOUNT.password,
	// 		timeout,
	// 	},
	// 	// onUpdate: async ({ cpuInfos, memInfos }) => {
	// 	// 	console.log(`on update`, cpuInfos, memInfos)
	// 	// },
	// 	// onConnect: (clearTimerFn: Function) => {
	// 	// 	EmulatorService.imagePerfsTimerMap[element.tooltip] = clearTimerFn;
	// 	// },
	// 	onDisconnect: () => {
	// 		console.log(`connection to ${host} disconnect`);
	// 	},
	// 	// onInitData: () => {
	// 	// 	return { cpuInfos, memInfos };
	// 	// },
	// };
	// MonitorService.getPerfs(connectionConfig);

	// vscode.window.tabGroups.onDidChangeTabs(async tabChangeEvent => {
	// 	console.log("onDidChangeTabs", tabChangeEvent);
	// 	const { opened, closed, changed } = tabChangeEvent;
	// 	console.log('opened', opened.length);
	// 	console.log('changed', changed.length);
	// 	console.log('closed', closed.length);
	// });


	// const terminal = vscode.window.createTerminal('test exit');
	// terminal.show();
	// terminal.sendText(`pwd`);

	// console.log('terminal name', terminal.name, terminal.state);
	// terminal.sendText("wsl")
	// setTimeout(() => {
	// 	terminal.sendText(`ls && whoami`);
	// 	// terminal.sendText(" exit")
	// }, 5 * 1000);

	// const disposableTerminal = vscode.window.onDidCloseTerminal((closedTerminal) => {
	// 	console.log('onDidCloseTerminal', closedTerminal.name)
	// 	if (closedTerminal === terminal) {
	// 		console.log('CLOSE1111');
	// 		// disposableTerminal.dispose();
	// 	}
	// });

	// vscode.window.onDidCloseTerminal(async (terminal: vscode.Terminal) => {
	// 	console.log('onDidCloseTerminal');
	// 	console.log('name', terminal.name);
	// 	console.log('state', terminal.state);
	// 	console.log('exitStatus', terminal.exitStatus);
	// 	const processId = await terminal.processId;
	// 	console.log('processId', processId);
	// });
	// vscode.window.onDidChangeTerminalState(async (terminal: vscode.Terminal) => {
	// 	console.log('onDidChangeTerminalState');
	// 	console.log('name', terminal.name);
	// 	console.log('state', terminal.state);
	// 	console.log('exitStatus', terminal.exitStatus);
	// 	const processId = await terminal.processId;
	// 	console.log('processId', processId);
	// });

	// const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
	// 	? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
	// if (!workspaceRoot) {
	// 	return;
	// }
	// context.subscriptions.push(vscode.tasks.registerTaskProvider(EchoTaskProvider.RakeType, new EchoTaskProvider()));



	// const rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : '';
	// if (rootPath) {
	// const fsWatcher = vscode.workspace.createFileSystemWatcher(
	// 	new vscode.RelativePattern(rootPath, 'annotation.yaml')
	//   );
	// const fsWatcher = vscode.workspace.createFileSystemWatcher('*/annotation.yaml');
	// fsWatcher.onDidCreate((uri) => {
	// 	console.log(`Created file: ${uri.fsPath}`);
	// 	// 在这里添加对新创建的annotation.yaml文件的处理逻辑
	// });

	// fsWatcher.onDidChange((uri) => {
	// 	console.log(`Changed file: ${uri.fsPath}`);
	// 	// 在这里添加对修改的annotation.yaml文件的处理逻辑
	// });

	// fsWatcher.onDidDelete((uri) => {
	// 	console.log(`Deleted file: ${uri.fsPath}`);
	// 	// 在这里添加对删除的annotation.yaml文件的处理逻辑
	// });

	// }

	// console.log('visibleTextEditors');
	// vscode.window.visibleTextEditors.forEach(editor => {
	// 	console.log(editor.document.uri);
	// });
	// async function getAllEditors() {
	// 	const editors: vscode.TextEditor[] = [];
	// 	const activeEditor = vscode.window.activeTextEditor;
	// 	if (!activeEditor) {
	// 		return editors;
	// 	}
	// 	editors.push(activeEditor)
	// 	console.log('getAllEditors activeEditor', activeEditor.document.uri);
	// 	while (true) {
	// 		await vscode.commands.executeCommand('workbench.action.nextEditor');
	// 		const newActiveEditor = vscode.window.activeTextEditor;
	// 		if (newActiveEditor?.document === activeEditor.document) {
	// 		// if (newActiveEditor === activeEditor) {
	// 			// 已经遍历完所有编辑器
	// 			break;
	// 		}
	// 		editors.push(newActiveEditor!);
	// 	}
	// 	return editors;
	// }

	// // 使用示例
	// const editors = await getAllEditors();
	// for (const editor of editors) {
	// 	console.log(editor.document.fileName, editor.document.uri);
	// }


	// vscode.workspace.onDidChangeTextDocument(
	// 	event => {
	// 		console.log("onDidChangeTextDocument");
	// 		const { document, contentChanges, reason } = event;
	// 		const { uri, fileName, languageId } = document;
	// 		console.log("doc info", uri, fileName, languageId);
	// 		console.log('contentChanges', contentChanges);
	// 		console.log("reason", reason);
	// 	},
	// 	null,
	// 	context.subscriptions,
	// );


	// vscode.window.onDidExecuteTerminalCommand(({ terminal, commandLine, cwd, exitCode, output }) => {
	// 	console.log('onDidExecuteTerminalCommand')
	// 	console.log('name', terminal.name)
	// 	console.log('commandLine', commandLine)
	// 	console.log('cwd', cwd)
	// 	console.log('exitCode', exitCode)
	// 	console.log('output', output)
	// 	console.log(`--------------------------------`)
	// })

	// new UseBrowserLiteCmd(context);
	// new Movies(context);
	// new News(context);
	// new Pty(context);
	// new NodePty(context)


	// const writeEmitter = new vscode.EventEmitter<string>();
	// const closeEmitter = new vscode.EventEmitter<void | number>();
	// const pty: vscode.Pseudoterminal = {
	// 	onDidWrite: writeEmitter.event,
	// 	onDidClose: closeEmitter.event,
	// 	open: () => { console.log('open'); writeEmitter.fire('\x1b[31mHello world\x1b[0m') },
	// 	close: () => { console.log('close'); },
	// 	handleInput: data => {
	// 		console.log('data', data);
	// 		if (data !== 'y') {
	// 			vscode.window.showInformationMessage('Something went wrong');
	// 		}
	// 		closeEmitter.fire()
	// 	}

	// 	// handleInput: data => writeEmitter.fire(data === '\r' ? '\r\n' : data)
	// };
	// const myPty = vscode.window.createTerminal({ name: 'Local echo', pty });
	// myPty.show()

	// const channel = OutputChannel.getSingleInstance()

	// const oldLog = console.log;
	// console.log = (...args) => {
	// 	// oldLog('hack log', args);
	// 	// channel.appendLine(args.toString());
	// 	// channel.show()
	// }


	// const arr = new Array(100).fill(0)
	// arr.forEach((item, index) => {
	// 	channel.appendLine([item, index].toString())
	// })
	// channel.show()

	// const pty = vscode.window.createTerminal({
	// 	name: 'jim-pty',
	// 	pty: new CreateTermCmd()
	// });
	// pty.show();

	// vscode.commands.registerCommand("jim-vsc-plugin-demo.auto-edit", () => {
	// 	// 获取当前活动的文本编辑器
	// 	const editor = vscode.window.activeTextEditor;

	// 	if (editor) {
	// 		// 使用 TextEditor 的 edit 方法对文档进行编辑
	// 		editor.edit((editBuilder) => {
	// 			// 在回调函数中进行编辑操作
	// 			editBuilder.insert(new vscode.Position(0, 0), 'Hello, World!');
	// 		}).then(() => {
	// 			console.log('Edit applied successfully');
	// 		});

	// 		// 监听 onDidChangeTextDocument 事件
	// 		vscode.workspace.onDidChangeTextDocument((event) => {
	// 			console.log('Text document changed:', event.document.uri.toString());
	// 		});
	// 	}
	// });


	// 注册 Tree View
	// activateTreeView(context);

	// 注册命令，用于打开 Tree View
	//     context.subscriptions.push(vscode.commands.registerCommand('extension.showTreeView', () => {
	//         vscode.window.createTreeView('spider.customTreeView"', { treeDataProvider: new TreeDataProvider() });
	//     }));

	// const commands = ['run-in-spike', 'run-in-qemu-user', 'run-in-qemu-with-ubuntu-22.04.03', 'run-in-qemu-with-ubuntu-23.10', 'run-in-qemu-with-debian-sid'];
	// // 注册菜单1指令
	// commands.forEach(cmd => {
	// 	context.subscriptions.push(vscode.commands.registerCommand(cmd, () => {
	// 		vscode.window.showInformationMessage(cmd);
	// 	}));
	// });


	// const terminal = vscode.window.createTerminal({
	// 	name: 'jim-terminal',
	// 	shellPath: "powershell.exe"
	// 	// hideFromUser: true,
	// });
	// const terminal2 = vscode.window.createTerminal({
	// 	name: 'jim-terminal2',
	// 	shellPath: "powershell.exe"
	// 	// hideFromUser: true,
	// });
	// const terminal3 = vscode.window.createTerminal({
	// 	name: 'jim-terminal3',
	// 	shellPath: "powershell.exe"
	// 	// hideFromUser: true,
	// });
	// terminal3.show();
	// terminal3.sendText(`ssh zoujinqiang@192.168.253.220`)

	// vscode.window.onDidCloseTerminal(async (terminal: vscode.Terminal) => {
	// 	console.log('onDidCloseTerminal');
	// 	console.log('name', terminal.name);
	// 	console.log('state', terminal.state);
	// 	console.log('exitStatus', terminal.exitStatus);
	// 	const processId = await terminal.processId;
	// 	console.log('processId', processId);
	// });
	// vscode.window.onDidChangeTerminalState(async (terminal: vscode.Terminal) => {
	// 	console.log('onDidChangeTerminalState');
	// 	console.log('name', terminal.name);
	// 	console.log('state', terminal.state);
	// 	console.log('exitStatus', terminal.exitStatus);
	// 	const processId = await terminal.processId;
	// 	console.log('processId', processId);
	// });
	// vscode.window.onDidChangeActiveTerminal(async (terminal?: vscode.Terminal) => {
	// 	console.log('onDidChangeActiveTerminal');
	// 	if (!terminal) {
	// 		return;
	// 	}
	// 	console.log('name', terminal.name);
	// 	console.log('state', terminal.state);
	// 	console.log('exitStatus', terminal.exitStatus);
	// 	const processId = await terminal.processId;
	// 	console.log('processId', processId);
	// });
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('deactivate');
}

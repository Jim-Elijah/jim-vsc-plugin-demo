import * as vscode from 'vscode';
import Movies from "./webviews/WebviewMovieList";
import News from './webviews/WebviewNewsList';
import UseBrowserLiteCmd from './commands/UseBrowserLiteCmd';
import Pty from './term/Pty';
import NodePty from './term/NodePty';

import CreateTermCmd from './term/CreateTermCmd';
import OutputChannel from './output/OutputChannel';
import { activate as activateTreeView } from './treeViews/treeviewProvider';


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('jim-vsc-plugin-demo.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from jim-vsc-plugin-demo!');
		console.log('command jim-vsc-plugin-demo.helloWorld triggered!');
	}));

	vscode.window.onDidExecuteTerminalCommand(({ terminal, commandLine, cwd, exitCode, output }) => {
		console.log('onDidExecuteTerminalCommand')
		console.log('name', terminal.name)
		console.log('commandLine', commandLine)
		console.log('cwd', cwd)
		console.log('exitCode', exitCode)
		console.log('output', output)
		console.log(`--------------------------------`)
	})

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
	//         vscode.window.createTreeView('customTreeView', { treeDataProvider: new TreeDataProvider() });
	//     }));

	const commands = ['run-in-spike', 'run-in-qemu-user', 'run-in-qemu-with-ubuntu-22.04.03', 'run-in-qemu-with-ubuntu-23.10', 'run-in-qemu-with-debian-sid'];
	// 注册菜单1指令
	commands.forEach(cmd => {
		context.subscriptions.push(vscode.commands.registerCommand(cmd, () => {
			vscode.window.showInformationMessage(cmd);
		}));
	});


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

	vscode.window.onDidCloseTerminal(async (terminal: vscode.Terminal) => {
		console.log('onDidCloseTerminal');
		console.log('name', terminal.name);
		console.log('state', terminal.state);
		console.log('exitStatus', terminal.exitStatus);
		const processId = await terminal.processId;
		console.log('processId', processId);
	});
	vscode.window.onDidChangeTerminalState(async (terminal: vscode.Terminal) => {
		console.log('onDidChangeTerminalState');
		console.log('name', terminal.name);
		console.log('state', terminal.state);
		console.log('exitStatus', terminal.exitStatus);
		const processId = await terminal.processId;
		console.log('processId', processId);
	});
	vscode.window.onDidChangeActiveTerminal(async (terminal?: vscode.Terminal) => {
		console.log('onDidChangeActiveTerminal');
		if (!terminal) {
			return;
		}
		console.log('name', terminal.name);
		console.log('state', terminal.state);
		console.log('exitStatus', terminal.exitStatus);
		const processId = await terminal.processId;
		console.log('processId', processId);
	});
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('deactivate');
}

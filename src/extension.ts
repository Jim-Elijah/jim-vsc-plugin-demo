import * as vscode from 'vscode';
import Movies from "./webviews/WebviewMovieList";
import News from './webviews/WebviewNewsList';
import UseBrowserLiteCmd from './commands/UseBrowserLiteCmd';
import Pty from './term/Pty';
import CreateTermCmd from './term/CreateTermCmd';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('jim-vsc-plugin-demo.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from jim-vsc-plugin-demo!');
		console.log('command jim-vsc-plugin-demo.helloWorld triggered!');
	}));
	new UseBrowserLiteCmd(context);
	new Movies(context);
	new News(context);
	new Pty(context);

	const pty = vscode.window.createTerminal({
        name: 'jim-pty',
        pty: new CreateTermCmd()
      });
    pty.show();
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('deactivate');
}

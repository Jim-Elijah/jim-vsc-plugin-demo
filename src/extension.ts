import * as vscode from 'vscode';
import Movies from "./webviews/WebviewMovieList";
import News from './webviews/WebviewNewsList';
import UseBrowserLiteCmd from './commands/UseBrowserLiteCmd';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('jim-vsc-plugin-demo.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from jim-vsc-plugin-demo!');
		console.log('command jim-vsc-plugin-demo.helloWorld triggered!');
	}));
	new UseBrowserLiteCmd(context);
	new Movies(context);
	new News(context);
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('deactivate');
}

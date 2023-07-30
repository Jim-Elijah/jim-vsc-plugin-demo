import * as vscode from 'vscode';
import Movies from "./webviews/WebviewMovies";

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "jim-vsc-plugin-demo" is now active!');

	const disposable = vscode.commands.registerCommand('jim-vsc-plugin-demo.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from jim-vsc-plugin-demo!');
		console.log('command jim-vsc-plugin-demo.helloWorld triggered!');
	});
	const obj = {
		name: 'jack',
		age: 20,
	};
	console.log('obj', obj);

	context.subscriptions.push(disposable);
	new Movies(context);
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('deactivate');
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import { error } from 'console';

export class EchoTaskProvider implements vscode.TaskProvider {
	static RakeType = 'echo';
	private rakePromise: Thenable<vscode.Task[]> | undefined = undefined;


	 public  provideTasks(): Thenable<vscode.Task[]> | undefined {
		console.log('provideTasks');
		return  getRakeTasks();
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		console.log('resolveTask');
		return _task;
		// const task = _task.definition.task;
		// // A Rake task consists of a task and an optional file as specified in RakeTaskDefinition
		// // Make sure that this looks like a Rake task by checking that there is a task.
		// if (task) {
		// 	// resolveTask requires that the same definition object be used.
		// 	const definition: RakeTaskDefinition = <any>_task.definition;
		// 	return new vscode.Task(definition, _task.scope ?? vscode.TaskScope.Workspace, definition.task, 'echo', new vscode.ShellExecution(`echo ${definition.content}`));
		// }
		// return undefined;
	}
}

interface RakeTaskDefinition extends vscode.TaskDefinition {
	/**
	 * The task name
	 */
	task: string;

	/**
	 * The rake file containing the task
	 */
	content?: string;
}

async function getRakeTasks(): Promise<vscode.Task[]> {
	console.log('getRakeTasks');
	const workspaceFolders = vscode.workspace.workspaceFolders;
	const result: vscode.Task[] = [];
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return result;
	}
	const items = ["spike", "qemu-user", "qemu-system"]
	const taskName = await vscode.window.showQuickPick(items, {
		placeHolder: "Select an emulator you want to run ",
		matchOnDescription: true,
		ignoreFocusOut: true,
	});
	console.log("taskName", taskName);
	if (!taskName) {
		return  result;
	}
	const kind: RakeTaskDefinition = {
		type: 'echo',
		task: taskName,
		content: taskName,
	};
	const task = new vscode.Task(kind, vscode.TaskScope.Workspace, taskName, 'echo', new vscode.ShellExecution(`echo ${taskName}`));
	result.push(task);
	return result;
}

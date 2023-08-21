import * as vscode from 'vscode';
import { readFile } from 'fs';
import { promisify } from 'util';
import * as path from 'path'

const homeDir = process.env.HOME || process.env.USERPROFILE || "";
const extDir = path.join(homeDir, ".vscode", "extensions", "extensions.json");

interface ExtensionJSONItem {
    identifier: { id: string }
}
export default class UseBrowserLiteCmd {
    private static context: vscode.ExtensionContext;
    private static readonly browserExtId = 'antfu.browse-lite';
    constructor(context: vscode.ExtensionContext) {
        UseBrowserLiteCmd.context = context;
        context.subscriptions.push(vscode.commands.registerCommand('jim-vsc-call-cmd-on-other-ext', (url: string) => {
            vscode.window.showInformationMessage('open browser');
            // vscode.commands.executeCommand('installExtension')
            // vscode.commands.executeCommand('browse-lite.open')
            this.openWithBrowseLite(url);
        }));
    }
    async openWithBrowseLite(url: string) {
        try {
            console.log('extDir', extDir);
            const extensions = await promisify(readFile)(extDir)
            const arr: Array<ExtensionJSONItem> = JSON.parse(extensions.toString('utf-8'))
            const hasExist = arr.find(item => item.identifier.id === UseBrowserLiteCmd.browserExtId)
            const enabled = vscode.extensions.getExtension(UseBrowserLiteCmd.browserExtId);
            console.log('hasExist', hasExist, enabled);
            const allExts = vscode.extensions.all
            // console.log('allExts', allExts);
            const hasExist1 = allExts.find(item => item.id === 'antfu.browse-lite');
            console.log('hasExist', hasExist1);
            if (!hasExist) {
                console.log('no exist');
                await vscode.commands.executeCommand('workbench.extensions.installExtension', UseBrowserLiteCmd.browserExtId)
                console.log('install success');
            } else {
                console.log('exist');
                if (enabled) {
                    console.log('enabled');
                } else {
                    console.log('disabled');
                }
                // vscode.commands.executeCommand('browse-lite.open', url || '');
            }
        } catch (e) {
            console.log('installBrowerExtension error', e);
        }
    }
}
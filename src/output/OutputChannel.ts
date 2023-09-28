import * as vscode from 'vscode';

export default class OutputChannel {
    private static channel: vscode.OutputChannel;
    static getSingleInstance() {
        if (OutputChannel.channel) {
            return OutputChannel.channel;
        }
        OutputChannel.channel = vscode.window.createOutputChannel('jim-vsc');
        return OutputChannel.channel;
    }
}
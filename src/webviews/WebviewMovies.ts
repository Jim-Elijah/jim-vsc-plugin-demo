import * as vscode from "vscode";
import WebviewMovie from "./WebviewMovie";
import { getNonce } from "../utils/helper";
import request from "../utils/request";
import { MovieList } from "../types/response/Movies";
import { mockMovies } from './mock';

class WebviewMovies implements vscode.WebviewViewProvider {
    // ref https://github.com/microsoft/vscode-extension-samples/blob/main/webview-view-sample/src/extension.ts
    public static readonly viewType = "jim-vsc.movies-view";

    private _view?: vscode.WebviewView;
    private readonly _extensionUri: vscode.Uri;

    constructor(
        context: vscode.ExtensionContext
    ) {
        this._extensionUri = context.extensionUri;

        if (vscode.window.registerWebviewPanelSerializer) {
            // Make sure we register a serializer in activation event
            vscode.window.registerWebviewPanelSerializer(WebviewMovie.viewType, {
                async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                    console.log(`deserialize state: ${state}`);
                    // Reset the webview options so we use latest uri for `localResourceRoots`.
                    webviewPanel.webview.options = {
                        enableScripts: true,
                        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "assets")],
                    };
                    const { newsId } = state || {};
                    WebviewMovie.revive(webviewPanel, context.extensionUri, newsId);
                },
            });
        }
    }

    public async resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "assets")],
        };

        // const res = await request<MovieList>('get', '/news', null);
        const res: MovieList = mockMovies;
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, res);

        // 插件监听消息
        webviewView.webview.onDidReceiveMessage(
            id => {
                console.log("WebviewMovies onDidReceiveMessage", id);
                WebviewMovie.createOrShow(this._extensionUri, id);
                // if (data) {
                //     vscode.window.showInformationMessage(text);
                //     return;
                // }
                // vscode.window.showErrorMessage(text);
            },
            undefined,
            [],
        );

        webviewView.onDidDispose(() => {
            console.log("bye qemu");
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview, data: MovieList) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, "assets", "js", "WebviewMovies.js");

        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        const nonce = getNonce();

        console.log("webview.cspSource", webview.cspSource);

        const list = data;

        // Local path to css styles
        const styleResetPath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "reset.css");
        const stylesVSCodePath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "vscode.css");
        const stylesMainPath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "WebviewMovies.css");

        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(styleResetPath);
        const stylesVSCodeUri = webview.asWebviewUri(stylesVSCodePath);
        const stylesMainUri = webview.asWebviewUri(stylesMainPath);

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<title>News</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource
            }; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesVSCodeUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">

			</head>
			<body>
				<ul id='news-wrapper'>
					${list.map(item => `<li class='news-item' data-id=${item.link}>${item.text}</li>`).join("")}
				</ul>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}

export default class Provider {
    constructor(context: vscode.ExtensionContext) {
        const moviesProvider = new WebviewMovies(context);
        context.subscriptions.push(vscode.window.registerWebviewViewProvider("movies", moviesProvider));
    }
}
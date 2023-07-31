import * as vscode from "vscode";
import WebviewNews from "./WebviewNews";
import { getNonce } from "../utils/helper";
import request from "../utils/request";
import { HotNews, News } from "../types/response/News";

class WebviewNewsList implements vscode.WebviewViewProvider {
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
            vscode.window.registerWebviewPanelSerializer(WebviewNews.viewType, {
                async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                    console.log(`deserialize state:`, state);
                    // Reset the webview options so we use latest uri for `localResourceRoots`.
                    webviewPanel.webview.options = {
                        enableScripts: true,
                        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "assets")],
                    };
                    WebviewNews.revive(webviewPanel, context.extensionUri, state || {});
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

        const res = await request<HotNews>('get', '/news/baidu', null);
        // const res: MovieList = mockMovies;
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, res.hotNews);

        // 插件监听消息
        webviewView.webview.onDidReceiveMessage(
            (obj) => {
                console.log("WebviewNewss onDidReceiveMessage", obj);
                WebviewNews.createOrShow(this._extensionUri, obj);
            },
            undefined,
            [],
        );

        webviewView.onDidDispose(() => {
            console.log("bye qemu");
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview, data: Array<News>) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, "assets", "js", "WebviewNewsList.js");

        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        const nonce = getNonce();

        console.log("webview.cspSource", webview.cspSource);

        const list = data;
        console.log('hotNews list', list);

        // Local path to css styles
        const styleResetPath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "reset.css");
        const stylesVSCodePath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "vscode.css");
        const stylesMainPath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "WebviewNewsList.css");

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
					${list.map(item => `<li class='news-item' data-id=${item.link} data-title=${item.text}>
                        <div class="title">${item.text}</div>
                    </li>`).join("")}
				</ul>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}

export default class Provider {
    constructor(context: vscode.ExtensionContext) {
        const moviesProvider = new WebviewNewsList(context);
        context.subscriptions.push(vscode.window.registerWebviewViewProvider("news", moviesProvider));
    }
}
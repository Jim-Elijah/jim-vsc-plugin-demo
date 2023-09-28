import * as vscode from "vscode";
import { getNonce } from "../utils/helper";
// import { HotNews } from "../types/response/News";

interface NewsObj {
    id: string;
    title: string
}

export default class WebviewMovie {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: WebviewMovie | undefined;

    public static readonly viewType = "jim-vsc-news";
    private static _id: string | number;
    private static _title: string;

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, obj: NewsObj) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        const { id, title } = obj;
        // 已经有webview，且其id与正要展示的id一样
        if (WebviewMovie.currentPanel && id === WebviewMovie._id) {
            WebviewMovie.currentPanel._panel.reveal(column);
            return;
        }
        WebviewMovie._id = id;
        WebviewMovie._title = title;
        // 已经有webview，且其id与正要展示的id不一样，新的替换旧的
        if (WebviewMovie.currentPanel) {
            console.log("已经有webview, 且其id与正要展示的id不一样, 新的替换旧的");
            WebviewMovie.currentPanel._update();
            return;
            // WebviewMovie.currentPanel.dispose();
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            WebviewMovie.viewType,
            title,
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, "assets")],
            },
        );

        WebviewMovie.currentPanel = new WebviewMovie(panel, extensionUri, id);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, obj: NewsObj) {
        const { id, title } = obj;
        WebviewMovie._id = id;
        WebviewMovie._title = title;
        WebviewMovie.currentPanel = new WebviewMovie(panel, extensionUri, id);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, id: string | number) {
        WebviewMovie._id = id;
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            e => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables,
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                console.log("WebviewMovie onDidReceiveMessage", message);
            },
            null,
            this._disposables,
        );
    }

    public dispose() {
        WebviewMovie.currentPanel = undefined;
        WebviewMovie._id = "";
        WebviewMovie._title = "";

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update() {
        const webview = this._panel.webview;
        this._panel.title = WebviewMovie._title;
        // const res = await request<WebviewMovie>("get", `/news/${WebviewMovie._id}`, null);
        // this._panel.webview.html = this._getHtmlForWebview(webview, res);
        this._panel.webview.html = this._getHtmlForWebview(webview);
        this._panel.webview.postMessage({
            id: WebviewMovie._id,
            title: WebviewMovie._title,
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview, data?: WebviewMovie) {
        console.log("content", data);
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, "assets", "js", "WebviewMovie.js");

        // // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        // Local path to css styles
        const styleResetPath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "reset.css");
        const stylesVSCodePath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "vscode.css");
        const stylesMainPath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "WebviewMovie.css");

        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(styleResetPath);
        const stylesVSCodeUri = webview.asWebviewUri(stylesVSCodePath);
        const stylesMainUri = webview.asWebviewUri(stylesMainPath);

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();
        console.log("webview.cspSource", webview.cspSource);

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
				-->
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
                
                <link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesVSCodeUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">

				<title></title>
			</head>
			<body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
                <iframe src="${WebviewMovie._id}" id="jim-iframe"></iframe>
			</body>
			</html>`;
    }
}

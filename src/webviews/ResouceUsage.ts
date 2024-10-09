import * as vscode from "vscode";
import { getNonce } from "../utils/helper";


interface ExtensionJSONItem {
    identifier: { id: string };
}

interface CPUInfo {
    user: number
    system: number
    idle: number
    ts: string
}

interface MEMInfo {
    total: number
    used: number
    free: number
    ts: string
}

const VIEW_TYPE = "resource-usage";

let cpuInfos = [
    {
        "user": 12.5,
        "system": 25,
        "idle": 62.5,
        "ts": "2024/9/10 15:36:25.93"
    },
    {
        "user": 18.8,
        "system": 18.8,
        "idle": 62.5,
        "ts": "2024/9/10 15:36:30.93"
    },
    {
        "user": 20,
        "system": 20,
        "idle": 60,
        "ts": "2024/9/10 15:36:35.100"
    },
    {
        "user": 18.8,
        "system": 18.8,
        "idle": 62.5,
        "ts": "2024/9/10 15:36:40.100"
    },
    {
        "user": 14.3,
        "system": 14.3,
        "idle": 71.4,
        "ts": "2024/9/10 15:36:45.101"
    },
    {
        "user": 18.8,
        "system": 18.8,
        "idle": 62.5,
        "ts": "2024/9/10 15:36:50.116"
    },
    {
        "user": 18.8,
        "system": 18.8,
        "idle": 62.5,
        "ts": "2024/9/10 15:36:55.117"
    },
    {
        "user": 20,
        "system": 13.3,
        "idle": 66.7,
        "ts": "2024/9/10 15:37:0.132"
    },
    {
        "user": 13.3,
        "system": 20,
        "idle": 66.7,
        "ts": "2024/9/10 15:37:5.133"
    },
    {
        "user": 18.8,
        "system": 18.8,
        "idle": 62.5,
        "ts": "2024/9/10 15:37:10.134"
    },
    {
        "user": 18.8,
        "system": 18.8,
        "idle": 62.5,
        "ts": "2024/9/10 15:37:15.149"
    },
    {
        "user": 13.3,
        "system": 20,
        "idle": 66.7,
        "ts": "2024/9/10 15:37:20.150"
    },
    {
        "user": 71.4,
        "system": 28.6,
        "idle": 0,
        "ts": "2024/9/10 15:37:25.150"
    },
    {
        "user": 43.8,
        "system": 25,
        "idle": 31.2,
        "ts": "2024/9/10 15:37:30.150"
    },
    {
        "user": 13.3,
        "system": 20,
        "idle": 66.7,
        "ts": "2024/9/10 15:37:35.160"
    },
    {
        "user": 20,
        "system": 13.3,
        "idle": 66.7,
        "ts": "2024/9/10 15:37:40.163"
    },
    {
        "user": 25,
        "system": 12.5,
        "idle": 62.5,
        "ts": "2024/9/10 15:37:45.167"
    }
];
let memInfos = [
    {
        "total": 1952.9,
        "used": 143.8,
        "free": 1816.5,
        "ts": "2024/9/10 15:36:25.93"
    },
    {
        "total": 1952.9,
        "used": 147.6,
        "free": 1812.5,
        "ts": "2024/9/10 15:36:30.93"
    },
    {
        "total": 1952.9,
        "used": 147.6,
        "free": 1812.5,
        "ts": "2024/9/10 15:36:35.100"
    },
    {
        "total": 1952.9,
        "used": 147.5,
        "free": 1812.5,
        "ts": "2024/9/10 15:36:40.100"
    },
    {
        "total": 1952.9,
        "used": 147.5,
        "free": 1812.5,
        "ts": "2024/9/10 15:36:45.101"
    },
    {
        "total": 1952.9,
        "used": 147.5,
        "free": 1812.5,
        "ts": "2024/9/10 15:36:50.116"
    },
    {
        "total": 1952.9,
        "used": 147.5,
        "free": 1812.5,
        "ts": "2024/9/10 15:36:55.117"
    },
    {
        "total": 1952.9,
        "used": 147.5,
        "free": 1812.5,
        "ts": "2024/9/10 15:37:0.132"
    },
    {
        "total": 1952.9,
        "used": 147.5,
        "free": 1812.5,
        "ts": "2024/9/10 15:37:5.133"
    },
    {
        "total": 1952.9,
        "used": 147.5,
        "free": 1812.5,
        "ts": "2024/9/10 15:37:10.134"
    },
    {
        "total": 1952.9,
        "used": 147.5,
        "free": 1812.5,
        "ts": "2024/9/10 15:37:15.149"
    },
    {
        "total": 1952.9,
        "used": 147.5,
        "free": 1812.5,
        "ts": "2024/9/10 15:37:20.150"
    },
    {
        "total": 1952.9,
        "used": 148.7,
        "free": 1811.3,
        "ts": "2024/9/10 15:37:25.150"
    },
    {
        "total": 1952.9,
        "used": 150.9,
        "free": 1809.1,
        "ts": "2024/9/10 15:37:30.150"
    },
    {
        "total": 1952.9,
        "used": 150.9,
        "free": 1809.1,
        "ts": "2024/9/10 15:37:35.160"
    },
    {
        "total": 1952.9,
        "used": 150.9,
        "free": 1809.1,
        "ts": "2024/9/10 15:37:40.163"
    },
    {
        "total": 1952.9,
        "used": 151.1,
        "free": 1808.9,
        "ts": "2024/9/10 15:37:45.167"
    }
];
const interval = 2 * 1000;

const getFormatDateTime = (param?: Date | string | undefined) => {
    let date: Date;
    if (!param) {
        date = new Date();
    } else if (typeof param === "string") {
        date = new Date(param);
    } else {
        date = param;
    }
    if (date.toString() === "Invalid Date") {
        throw new Error(`${param} is not a date!`);
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const mills = date.getMilliseconds();
    return [year, "/", month, "/", day, " ", hour, ":", minute, ":", second, ".", mills].join("");
};

function getRandomOne<T extends { ts: string }>(data: Array<T>) {
    const len = data.length
    const { ts } = data[len - 1];
    const index = Math.floor(Math.random() * len);
    return { ...data[index], ts: getFormatDateTime(new Date(new Date(ts).getTime() + interval * 1000)) }
}


export default class NewsService implements vscode.WebviewViewProvider {
    // ref https://github.com/microsoft/vscode-extension-samples/blob/main/webview-view-sample/src/extension.ts
    private _view?: vscode.WebviewView;
    private readonly _extensionUri: vscode.Uri;
    constructor(context: vscode.ExtensionContext) {
        this._extensionUri = context.extensionUri;

        context.subscriptions.push(vscode.window.registerWebviewViewProvider(VIEW_TYPE, this));
    }

    public async resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "assets")],
        };

        this._view.webview.html = this._getHtmlForWebview(this._view.webview);


        const data = { cpuInfos, memInfos };
        this._view.webview.postMessage({ command: "update", data });

        setInterval(() => {
            cpuInfos = cpuInfos.concat(getRandomOne<CPUInfo>(cpuInfos));
            memInfos = memInfos.concat(getRandomOne<MEMInfo>(memInfos))

            const data = { cpuInfos, memInfos };

            this._view?.webview?.postMessage({ command: "update", data });
        }, interval);

    }
    private _getHtmlForWebview(webview: vscode.Webview) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, "assets", "js", "RISCVNewsProvider.js");

        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        console.log("webview.cspSource", webview.cspSource);

        // Local path to css styles
        const styleResetPath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "reset.css");
        const stylesVSCodePath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "vscode.css");
        const stylesMainPath = vscode.Uri.joinPath(this._extensionUri, "assets", "css", "RISCVNewsProvider.css");

        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(styleResetPath);
        const stylesVSCodeUri = webview.asWebviewUri(stylesVSCodePath);
        const stylesMainUri = webview.asWebviewUri(stylesMainPath);


        const nonce = getNonce();
        const imageChartsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "assets", "js", "ResourceUsageCharts.js"));


        let html = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>仿真系统详情</title>
                <style>
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .section {
                        margin-bottom: 20px;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                    }
                    .section h2 {
                        margin-top: 0;
                    }
                    .info {
                        margin-bottom: 10px;
                        word-break: break-all;
                    }
                    .info span {
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
             <div class="container">
        `;

        html += `
                <div id="chart-container" style="width: 600px; height: 400px;"></div>
                <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
                <script nonce="${nonce}" src="${imageChartsUri}"></script>
            `;
        html += `
                </div>
            </body>
            </html>
        `;
        return html;
    }
}

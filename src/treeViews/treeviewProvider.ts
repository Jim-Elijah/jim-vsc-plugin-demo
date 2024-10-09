import * as vscode from 'vscode';
import * as path from 'path';

class TreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string | vscode.TreeItemLabel,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly badge: string,
        public readonly children?: TreeItem[]
    ) {
        super(label, collapsibleState);

        // 设置图标
        if (collapsibleState === vscode.TreeItemCollapsibleState.Collapsed) {
            this.iconPath = new vscode.ThemeIcon('folder');
        } else {
            // this.iconPath = new vscode.ThemeIcon('file');
            this.iconPath = path.join(__dirname, "..", "..", "assets", "img", "hotspot-flame.svg")
        }
        this.resourceUri = vscode.Uri.parse(`/custom-tree-view?${JSON.stringify({ badge })}`);
    }
}

class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        if (element) {
            // 返回二级菜单的子项
            return Promise.resolve(element.children || []);
        } else {
            // 返回一级菜单的根项
            return Promise.resolve([
                new TreeItem({ label: "Menu-1", highlights: [[0, 4], [5, 6]] }, vscode.TreeItemCollapsibleState.Collapsed, "1", [
                    new TreeItem({ label: "Menu-1-1", highlights: [[0, 4], [5, 6]] }, vscode.TreeItemCollapsibleState.None, "2"),
                    new TreeItem({ label: "Menu-1-2", highlights: [[0, 4], [5, 6]] }, vscode.TreeItemCollapsibleState.None, "M3")
                ]),
                new TreeItem({ label: "Menu-2", highlights: [[0, 4], [5, 6]] }, vscode.TreeItemCollapsibleState.Collapsed, "4", [
                    new TreeItem({ label: "Menu-2-1", highlights: [[0, 4], [5, 6]] }, vscode.TreeItemCollapsibleState.None, "5"),
                    new TreeItem({ label: "Menu-2-2", highlights: [[0, 4], [5, 6]] }, vscode.TreeItemCollapsibleState.None, "M,6")
                ])
            ]);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    const treeDataProvider = new TreeDataProvider();
    context.subscriptions.push(vscode.window.registerTreeDataProvider('spider.customTreeView', treeDataProvider))
    context.subscriptions.push(...[TreeViewFileDecorationProvider.getInstance()]);
}

export class TreeViewFileDecorationProvider implements vscode.FileDecorationProvider {
    // ref: https://github.com/microsoft/vscode-pull-request-github/blob/19a54d579146c46bc81d0c7db2df802f96aa95ba/src/view/treeDecorationProvider.ts
    private disposables: vscode.Disposable[];
    private static current: TreeViewFileDecorationProvider;
    static colorMap: Map<string, vscode.ThemeColor> = new Map<string, vscode.ThemeColor>();
    private _onDidChangeFileDecorations: vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined> =
        new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> =
        this._onDidChangeFileDecorations.event;
    private constructor() {
        this.disposables = [];
        this.disposables.push(vscode.window.registerFileDecorationProvider(this));
        TreeViewFileDecorationProvider.current = this;
    }
    static getInstance() {
        return TreeViewFileDecorationProvider.current || new TreeViewFileDecorationProvider();
    }
    static add2ColorMap(key: string, value: vscode.ThemeColor) {
        TreeViewFileDecorationProvider.colorMap.set(key, value);
        console.log("size", TreeViewFileDecorationProvider.colorMap.size);
    }
    // package.json 中的 enablement 不能动态render UI, 所以都采取装饰器装饰树状图
    async provideFileDecoration(
        uri: vscode.Uri,
        token: vscode.CancellationToken,
    ): Promise<vscode.FileDecoration | undefined> {
        // console.log('provideFileDecoration', uri);
        const obj = JSON.parse(uri.query || "") || {};
        console.log("obj", obj);
        if (uri.path === "/custom-tree-view") {
            if (obj.badge) {
                return {
                    badge: obj.badge,
                };
            }
        }
        return undefined;
    }
    refresh() {
        console.log("refreshing TreeViewFileDecorationProvider...");
        this._onDidChangeFileDecorations.fire(undefined);
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}

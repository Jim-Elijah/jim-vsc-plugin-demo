import * as vscode from 'vscode';

class TreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly children?: TreeItem[]
    ) {
        super(label, collapsibleState);
        
        // 设置图标
        if (collapsibleState === vscode.TreeItemCollapsibleState.Collapsed) {
            this.iconPath = new vscode.ThemeIcon('folder');
        } else {
            this.iconPath = new vscode.ThemeIcon('file');
        }
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
                new TreeItem('Menu 1', vscode.TreeItemCollapsibleState.Collapsed, [
                    new TreeItem('Item 1.1', vscode.TreeItemCollapsibleState.None),
                    new TreeItem('Item 1.2', vscode.TreeItemCollapsibleState.None)
                ]),
                new TreeItem('Menu 2', vscode.TreeItemCollapsibleState.Collapsed, [
                    new TreeItem('Item 2.1', vscode.TreeItemCollapsibleState.None),
                    new TreeItem('Item 2.2', vscode.TreeItemCollapsibleState.None)
                ])
            ]);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    const treeDataProvider = new TreeDataProvider();
    vscode.window.registerTreeDataProvider('customTreeView', treeDataProvider);
}
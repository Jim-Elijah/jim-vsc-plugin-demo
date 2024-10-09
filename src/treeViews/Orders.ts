import * as vscode from 'vscode';
import UserView, { User, userList, UserTreeItem } from "./Users";
import ProductView, { Product, productList, ProductTreeItem, } from './Products';
import { bus } from "../utils/helper"
import { HYBRID_VIEW_REFRESH_EVENT, PRODUCT_VIEW_REFRESH_EVENT, USER_VIEW_REFRESH_EVENT } from '../utils/constant';

class OrderView implements vscode.TreeDataProvider<User | Product> {
    private _onDidChangeTreeData: vscode.EventEmitter<User | Product | undefined> = new vscode.EventEmitter<User | Product | undefined>();
    readonly onDidChangeTreeData: vscode.Event<User | Product | undefined> = this._onDidChangeTreeData.event;
    private userView: UserView;
    private productView: ProductView;
    constructor() {
        this.userView = new UserView();
        this.productView = new ProductView();
        bus.on(USER_VIEW_REFRESH_EVENT, (element: User) => {
            this.refresh(element)
        })
        bus.on(PRODUCT_VIEW_REFRESH_EVENT, (element: Product) => {
            this.refresh(element)
        })
        bus.on(HYBRID_VIEW_REFRESH_EVENT, () => {
            this.refresh()
        })
    }
    getTreeItem(element: User | Product): vscode.TreeItem {
        if (element instanceof User) {
            return new UserTreeItem(element);
        }
        return new ProductTreeItem(element);
    }

    async getChildren(element?: User | Product): Promise<(User | Product)[]> {
        if (!element) {
            const users = await this.userView.getChildren();
            const products = await this.productView.getChildren();

            return Promise.resolve([...users, ...products]);
        }

        return Promise.resolve([]);
    }
    refresh(element?: User | Product | undefined) {
        this._onDidChangeTreeData.fire(element);
    }
}

export default class OrdersProvider {
    static viewId = "orders-view";
    constructor(context: vscode.ExtensionContext) {
        const view = new OrderView();
        context.subscriptions.push(vscode.window.registerTreeDataProvider(OrdersProvider.viewId, view));

        vscode.commands.registerCommand("orders.refresh", async () => {
            view.refresh();
        });
    }
}
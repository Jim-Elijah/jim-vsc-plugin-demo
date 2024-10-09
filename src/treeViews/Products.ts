import * as vscode from 'vscode';
import { sleep, bus } from '../utils/helper';
import { PRODUCT_VIEW_REFRESH_EVENT } from '../utils/constant';


export class Product {
    id: string;
    name: string;
    price: number;
    constructor({ id, name, price }: {
        id: string
        name: string
        price: number
    }) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

export const productList = [
    { id: "001", name: "shoes", price: 10 },
    { id: "002", name: "hat", price: 10 },
    { id: "003", name: "watch", price: 10 },
];

export class ProductTreeItem extends vscode.TreeItem {
    constructor(
        public readonly rawData: Product,
    ) {
        super(rawData.name, vscode.TreeItemCollapsibleState.None);
        this.description = `price: ${rawData.price}`;
        this.tooltip = `id: ${rawData.id}, name: ${rawData.name}, price: ${rawData.price}`;
    }
}

export default class ProductView implements vscode.TreeDataProvider<Product> {
    private _onDidChangeTreeData: vscode.EventEmitter<Product | undefined> = new vscode.EventEmitter<Product | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Product | undefined> = this._onDidChangeTreeData.event;
    private products: Product[] = [];
    static apiCalledTime = 4000;
    getTreeItem(product: Product): vscode.TreeItem {
        return new ProductTreeItem(product);
    }

    async getChildren(element?: Product): Promise<Product[]> {
        if (!element) {
            await sleep(ProductView.apiCalledTime);
            this.products = productList.map(product => new Product(product));
            return Promise.resolve(this.products);
        }

        return Promise.resolve([]);
    }
    refresh(element?: Product) {
        console.log("refreshing Product...");
        // this._onDidChangeTreeData.fire(element);
        bus.emit(PRODUCT_VIEW_REFRESH_EVENT, element)
    }
}

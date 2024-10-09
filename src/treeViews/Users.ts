import * as vscode from 'vscode';
import { sleep, bus } from '../utils/helper';
import { USER_VIEW_REFRESH_EVENT } from '../utils/constant';


enum Gender {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    M = "male",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    F = "female"
}

export class User {
    id: string | number;
    name: string;
    age: number;
    gender: Gender;
    constructor({ id, name, age, gender }: {
        id: string;
        name: string
        age: number
        gender: Gender
    }) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.gender = gender;
    }
}
export const userList = [
    { id: "2000-01-01", name: 'tom', age: 3, gender: Gender.M },
    { id: "2000-01-02", name: 'jerry', age: 2, gender: Gender.M },
];

export class UserTreeItem extends vscode.TreeItem {
    constructor(
        public readonly rawData: User,
    ) {
        super(rawData.name, vscode.TreeItemCollapsibleState.None);
        this.description = `age: ${rawData.age}`;
        this.tooltip = `id: ${rawData.id}, name: ${rawData.name}, age: ${rawData.age}, gender: ${rawData.gender}`;
    }
}

export default class UserView implements vscode.TreeDataProvider<User> {
    private _onDidChangeTreeData: vscode.EventEmitter<User | undefined> = new vscode.EventEmitter<User | undefined>();
    readonly onDidChangeTreeData: vscode.Event<User | undefined> = this._onDidChangeTreeData.event;
    private users: User[] = [];
    static interval = 5000;
    static timerId: NodeJS.Timer;
    static maxCount = 10;
    static currentCont = 0;
    constructor() {
        UserView.timerId = setInterval(() => {
            if (UserView.currentCont < 10) {
                console.log(`currentCont: ${UserView.currentCont}`);
                UserView.currentCont++;
                this.refresh();
            } else {
                clearInterval(UserView.timerId);
            }
        }, UserView.interval);
    }
    getTreeItem(user: User): vscode.TreeItem {
        return new UserTreeItem(user);
    }

    getChildren(element?: User): Thenable<User[]> {
        if (!element) {
            console.log('root');
            this.users = userList.map(user => new User({ ...user, age: user.age + UserView.currentCont }));
            return Promise.resolve(this.users);
        }
        console.log('non root');
        return Promise.resolve([]);
    }
    refresh(element?: User) {
        console.log("refreshing User...");
        // this._onDidChangeTreeData.fire(element || undefined);
        bus.emit(USER_VIEW_REFRESH_EVENT, element)
    }
}

import * as sqlite from 'sqlite';
import * as sqlite3 from "sqlite3";
import * as path from 'path'
import * as fs from 'fs'
import { homedir } from './env';

export default class SQLiteDB {
    static keyPrefix = "riscv";
    static current: SQLiteDB;
    static stateDir = path.join(homedir, "Documents", "RISCV", "data");
    static dbPath: string = path.join(SQLiteDB.stateDir, "database.db");
    static statePath: string = path.join(SQLiteDB.stateDir, "state.json");
    static bakStatePath: string = path.join(SQLiteDB.stateDir, "state.json.bak");
    private db: sqlite.Database | null = null;

     constructor() {
        SQLiteDB.current = this;
    }
    static getInstance() {
        if (!SQLiteDB.current) {
            new SQLiteDB();
        }
        return SQLiteDB.current;
    }

    async read() {
        console.log('this.db', this.db);
        if (!this.db) {
            console.log("SQLiteDB.dbPath", SQLiteDB.dbPath);
            this.db = await sqlite.open({
                filename: SQLiteDB.dbPath,
                driver: sqlite3.Database,
            });
        }

        // start
        if (fs.existsSync(SQLiteDB.statePath)) {
            console.log(`creating database.db with state.json`);
            const state = fs.readFileSync(SQLiteDB.statePath)
            await this.db.exec(`CREATE TABLE IF NOT EXISTS IDE (id INTEGER PRIMARY KEY, data BLOB)`);

            // 插入数据
            await this.db.run('INSERT INTO IDE (data) VALUES (?)', state);
        }
        // end

        const ret = await this.db.get(`select * from IDE`);
        const data = ret.data.toString('utf-8');
        const res = JSON.parse(data) || {};
        if (res && typeof res === "object") {
            return res || {};
        }
        return JSON.parse(res) || {};
    }
    private async _get(key: string, isArray = false) {
        const data = await this.read();
        const value = data[key];
        if (isArray) {
            return Array.isArray(value) ? value : value ? Object.values(value) : [];
        }
        return value || {};
    }
    private async _update(key: string, value: any) {
        const data = await this.read();
        console.log("key: value", key, value);
        console.log(`data[${key}]`, data[key]);

        if (data[key] && typeof data[key] === "object") {
            // 兼容数组
            if (Array.isArray(value) && Array.isArray(data[key])) {
                data[key] = [...value];
            } else {
                // 否则，直接赋值
                data[key] = value && typeof value === "object" ? { ...data[key], ...value } : value;
            }
        } else {
            data[key] = value;
        }
        await this.db!.run(`update IDE set data = ? where id = ?`, [Buffer.from(JSON.stringify(data), 'utf-8'), 1]);
    }

    get(key: string, isArray = false): Promise<any> {
        return this._get(`${SQLiteDB.keyPrefix}.${key}`, isArray);
    }
    update(key: string, value: any): Promise<void> {
        return this._update(`${SQLiteDB.keyPrefix}.${key}`, value,);
    }
    clear(key: string): Promise<void> {
        return this._update(`${SQLiteDB.keyPrefix}.${key}`, undefined,);
    }
}

export class GlobalState extends SQLiteDB { }
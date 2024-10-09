import * as os from "os";
import * as path from "path";
import * as process from "process";
import { workspace } from "vscode";

const platform = os.platform();
const hostname = os.hostname();
const isWin = platform === "win32";
const homedir = os.homedir()

export {
    isWin,
    homedir,
}
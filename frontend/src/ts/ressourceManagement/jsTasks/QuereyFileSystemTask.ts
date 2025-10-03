import { postFSMessage } from "../TaskQueue";
import { FSTask } from "../Task";

export type FileEntry = { kind: "file"; name: string };
export type DirectoryEntry = { kind: "directory"; name: string; children: (FileEntry | DirectoryEntry)[] };
export type FSEntry = FileEntry | DirectoryEntry;
export type QueryFileSystemTaskFinishedCallback = (returnValue: DirectoryEntry | undefined) => void;

export class QueryFileSystemTask extends FSTask {
	private _path: string;
	private _maxDepth: number;
	private _taskID!: number;
	private _finishedCallback: QueryFileSystemTaskFinishedCallback;

	public constructor(path: string, maxDepth: number, finishedCallback: QueryFileSystemTaskFinishedCallback) {
		super();
		this._path = path;
		this._maxDepth = maxDepth;
		this._finishedCallback = finishedCallback;
	}

	public run(taskID: number, worker: Worker): void {
		this._taskID = taskID;
		postFSMessage(worker, taskID, "queryFileSystem", { path: this._path, maxDepth: this._maxDepth }, []);
	}

	public progressCallback(progress: number, maximum: number) {
		console.log(this._taskID, progress, maximum);
	}

	public finishedCallback(returnValue: DirectoryEntry | undefined) {
		this._finishedCallback(returnValue);
	}
}

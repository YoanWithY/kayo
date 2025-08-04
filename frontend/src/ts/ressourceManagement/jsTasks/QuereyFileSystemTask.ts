import { ConcurrentTaskQueue } from "../ConcurrentTaskQueue";
import { JsTask } from "../Task";

export type FileEntry = { kind: "file"; name: string };
export type DirectoryEntry = { kind: "directory"; name: string; children: (FileEntry | DirectoryEntry)[] };
export type FSEntry = FileEntry | DirectoryEntry;

export class QueryFileSystemTask extends JsTask {
	private _path: string;
	private _maxDepth: number;
	private _taskID!: number;
	private _finishedCallback: (returnValue: DirectoryEntry | undefined) => void;

	public constructor(
		path: string,
		maxDepth: number,
		finishedCallback: (returnValue: DirectoryEntry | undefined) => void,
	) {
		super();
		this._path = path;
		this._maxDepth = maxDepth;
		this._finishedCallback = finishedCallback;
	}

	public run(taskQueue: ConcurrentTaskQueue, taskID: number, workerID: number): void {
		this._taskID = taskID;
		taskQueue.remoteJSCall(workerID, taskID, "queryFileSystem", { path: this._path, maxDepth: this._maxDepth }, []);
	}

	public progressCallback(progress: number, maximum: number) {
		console.log(this._taskID, progress, maximum);
	}

	public finishedCallback(returnValue: DirectoryEntry | undefined) {
		this._finishedCallback(returnValue);
	}
}

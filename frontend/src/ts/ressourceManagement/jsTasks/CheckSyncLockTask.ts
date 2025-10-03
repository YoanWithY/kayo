import { postFSMessage } from "../TaskQueue";
import { FSTask } from "../Task";

export type CheckSyncLockTaskFinishedCallback = (returnValue: boolean | undefined) => void;

export class CheckSyncLockTask extends FSTask {
	private _path: string;
	private _fileName: string;
	private _taskID!: number;
	private _finishedCallback: CheckSyncLockTaskFinishedCallback;

	/**
	 * @param taskQueue The WASMX instance.
	 * @param path The root relative directory path.
	 * @param fileName The file name to read from.
	 */
	public constructor(path: string, fileName: string, finishedCallback: CheckSyncLockTaskFinishedCallback) {
		super();
		this._path = path;
		this._fileName = fileName;
		this._finishedCallback = finishedCallback;
	}

	public run(taskID: number, worker: Worker) {
		this._taskID = taskID;
		postFSMessage(
			worker,
			this._taskID,
			"checkSyncLock",
			{
				path: this._path,
				fileName: this._fileName,
			},
			[],
		);
	}

	public progressCallback(progress: number, maximum: number) {
		console.log(this._taskID, progress, maximum);
	}

	public finishedCallback(returnValue: boolean | undefined) {
		this._finishedCallback(returnValue);
	}
}

import { ConcurrentTaskQueue } from "../ConcurrentTaskQueue";
import { JsTask } from "../Task";

export type LoadFileTaskFinishedCallback = (returnValue: Uint8Array<ArrayBuffer> | undefined) => void;

export class LoadFileTask extends JsTask {
	private _path: string;
	private _fileName: string;
	private _taskID!: number;
	private _finishedCallback: LoadFileTaskFinishedCallback;

	/**
	 * @param taskQueue The WASMX instance.
	 * @param path The root relative directory path.
	 * @param fileName The file name to read from.
	 */
	public constructor(path: string, fileName: string, finishedCallback: LoadFileTaskFinishedCallback) {
		super();
		this._path = path;
		this._fileName = fileName;
		this._finishedCallback = finishedCallback;
	}

	public run(taskQueue: ConcurrentTaskQueue, taskID: number, workerID: number) {
		this._taskID = taskID;
		taskQueue.remoteJSCall(
			workerID,
			this._taskID,
			"loadFile",
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

	public finishedCallback(returnValue: Uint8Array<ArrayBuffer> | undefined) {
		this._finishedCallback(returnValue);
	}
}

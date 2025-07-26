import WASMX from "../WASMX";
import { JsTask } from "./Task";

export class StoreFileTask extends JsTask {
	private _wasmx: WASMX;
	private _path: string;
	private _fileName: string;
	private _data: Uint8Array<ArrayBufferLike>;
	private _taskID!: number;

	/**
	 *
	 * @param wasmx The WASMX instance.
	 * @param path The root relative directory path.
	 * @param fileName The file name to write to.
	 * @param data The data to write.
	 */
	public constructor(wasmx: WASMX, path: string, fileName: string, data: Uint8Array<ArrayBufferLike>) {
		super();
		this._wasmx = wasmx;
		this._path = path;
		this._fileName = fileName;
		this._data = data;
	}

	public run(taskID: number, workerID: number) {
		this._taskID = taskID;
		this._wasmx.taskQueue.remoteJSCall(
			workerID,
			this._taskID,
			"storeFile",
			{
				path: this._path,
				fileName: this._fileName,
				data: this._data,
			},
			this._data.buffer instanceof ArrayBuffer ? [this._data.buffer] : [],
		);
	}

	public progressCallback(progress: number, maximum: number) {
		console.log(this._taskID, progress, maximum);
	}

	public finishedCallback(_: number) {}
}

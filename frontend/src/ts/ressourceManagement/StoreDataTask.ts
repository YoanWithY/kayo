import WASMX from "../WASMX";
import { JsTask } from "./ConcurrentTaskQueue";

export class StoreDataTask implements JsTask {
	private _wasmx: WASMX;
	private _path: string;
	private _fileName: string;
	private _data: ArrayBufferLike;
	private _offset: number;
	private _byteLength: number;
	private _taskID!: number;
	public constructor(
		wasmx: WASMX,
		path: string,
		fileName: string,
		data: ArrayBufferLike,
		offset: number,
		byteLength: number,
	) {
		this._wasmx = wasmx;
		this._path = path;
		this._fileName = fileName;
		this._data = data;
		this._offset = offset;
		this._byteLength = byteLength;
	}

	public run(taskID: number, workerID: number) {
		this._taskID = taskID;
		this._wasmx.taskQueue.remoteJSCall(
			workerID,
			this._taskID,
			"writeFile",
			{
				path: this._path,
				fileName: this._fileName,
				buffer: this._data,
				offset: this._offset,
				byteLength: this._byteLength,
			},
			this._data instanceof ArrayBuffer ? [this._data] : [],
		);
	}

	public progressCallback(progress: number, maximum: number) {
		console.log(this._taskID, progress, maximum);
	}

	public finishedCallback(_: number) {
		// console.log(this._taskID, returnValue);
	}
}

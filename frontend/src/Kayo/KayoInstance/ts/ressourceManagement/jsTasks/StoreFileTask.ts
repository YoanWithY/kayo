import { postFSMessage } from "../TaskQueue";
import { FSTask } from "../Task";

type CallbackType = (returnValue: true | undefined) => void;

export class StoreFileTask extends FSTask {
	private _path: string;
	private _fileName: string;
	private _data: Uint8Array<ArrayBufferLike>;
	private _taskID!: number;
	private _finishedCallback?: CallbackType;

	/**
	 *
	 * @param taskQueue The task queue instance.
	 * @param path The root relative directory path.
	 * @param fileName The file name to write to.
	 * @param data The data to write.
	 */
	public constructor(
		path: string,
		fileName: string,
		data: Uint8Array<ArrayBufferLike>,
		finishedCallback?: CallbackType,
	) {
		super();
		this._path = path;
		this._fileName = fileName;
		this._data = data;
		this._finishedCallback = finishedCallback;
	}

	public run(taskID: number, worker: Worker) {
		this._taskID = taskID;
		postFSMessage(
			worker,
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

	public finishedCallback(returnValue: true | undefined) {
		if (this._finishedCallback) this._finishedCallback(returnValue);
	}
}

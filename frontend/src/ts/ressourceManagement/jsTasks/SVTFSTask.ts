type IO = "read" | "write";

export abstract class SVTFSTask {
	protected abstract _io: IO;
	protected _textureID: string;
	protected _level: number;
	protected _tileX: number;
	protected _tileY: number;
	protected _finishedCallback: (returnValue: any) => void;
	public constructor(
		textureID: string,
		level: number,
		tileX: number,
		tileY: number,
		finishedCallback: (_: any) => void,
	) {
		this._textureID = textureID;
		this._level = level;
		this._tileX = tileX;
		this._tileY = tileY;
		this._finishedCallback = finishedCallback;
	}
	protected abstract getArgument(): any;
	public run(taskID: number, svtWorker: Worker): void {
		svtWorker.postMessage({
			func: this._io === "read" ? "readTile" : "writeTile",
			taskID,
			args: this.getArgument(),
		});
	}

	public finishedCallback(returnValue: any): void {
		this._finishedCallback(returnValue);
	}
}

export class SVTWriteTask extends SVTFSTask {
	protected _io: IO = "write";
	protected _data: Uint8Array<SharedArrayBuffer>;
	public constructor(
		data: Uint8Array<SharedArrayBuffer>,
		textureID: string,
		level: number,
		tileX: number,
		tileY: number,
		finishedCallback: (returnValue: number) => void,
	) {
		super(textureID, level, tileX, tileY, finishedCallback);
		this._data = data;
	}
	protected getArgument() {
		return {
			data: this._data,
			textureID: this._textureID,
			level: this._level,
			tileX: this._tileX,
			tileY: this._tileY,
		};
	}
}

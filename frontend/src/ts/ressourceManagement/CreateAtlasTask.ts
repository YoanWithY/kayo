import { ImageDataUint8, WasmCreateAtlasTask } from "../../c/KayoCorePP";
import WASMX from "../WASMX";
import { WasmTask } from "./Task";

export class CreateAtlasTask extends WasmTask {
	private _wasmx: WASMX;
	private _imageData: ImageDataUint8;
	private _taskID!: number;
	private _wasmTask!: WasmCreateAtlasTask;
	private _callback: (ret: any) => void;

	public constructor(wasmx: WASMX, imageData: ImageDataUint8, finishedCallback: (ret: any) => void) {
		super();
		this._wasmx = wasmx;
		this._imageData = imageData;
		this._callback = finishedCallback;
	}

	public run(taskID: number): void {
		this._taskID = taskID;
		this._wasmTask = new this._wasmx.wasm.WasmCreateAtlasTask(taskID, this._imageData);
		this._wasmTask.run();
	}
	public progressCallback(progress: number, maximum: number): void {
		console.log(this._taskID, progress, maximum);
	}
	public finishedCallback(returnValue: any): void {
		this._callback(returnValue);
		this._wasmTask.delete();
	}
}

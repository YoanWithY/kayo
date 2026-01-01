import { EmbindString, VectorMesh, WasmParseObjTask } from "../../../c/KayoCorePP";
import WASMX from "../../WASMX";
import { WasmTask } from "../Task";

export class ParseObjTask extends WasmTask {
	private _wasmx: WASMX;
	private _taskID!: number;
	private _wasmTask!: WasmParseObjTask;
	private _objFile: EmbindString;
	private _callback: (ret: any) => void;

	public constructor(wasmx: WASMX, objFile: EmbindString, finishedCallback: (ret: { meshes: VectorMesh }) => void) {
		super();
		this._wasmx = wasmx;
		this._objFile = objFile;
		this._callback = finishedCallback;
	}

	public run(taskID: number): void {
		this._taskID = taskID;
		this._wasmTask = new this._wasmx.wasm.WasmParseObjTask(taskID, this._objFile);
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

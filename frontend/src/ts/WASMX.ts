import type { KayoPointer, MainModule, ProjectData } from "../c/KayoCorePP";
export type StatePath = { map: boolean; val: string }[];
export type KayoWasmAddress = number;

export default class WASMX {
	public imageData;
	private _KN;
	private _wasm: MainModule;
	private _projectData: ProjectData;

	public constructor(module: MainModule) {
		this._wasm = module;
		this._KN = module.KN;
		this.imageData = module.ImageData;
		this._projectData = new this.wasm.ProjectData();
	}

	public get wasm() {
		return this._wasm;
	}

	public get KN() {
		return this._KN;
	}

	public get heap(): Uint8Array<SharedArrayBuffer> {
		return this._wasm.HEAPU8;
	}

	public get projectData() {
		return this._projectData;
	}

	public getMemoryView(byteOffset: number, byteLength: number) {
		return new Uint8Array(this.heap.buffer, byteOffset, byteLength);
	}

	public getFloat64View(ptr: KayoPointer) {
		return new Float64Array(this.heap.buffer, ptr.byteOffset, ptr.byteLength / 8);
	}

	public deleteFloat64Array(ptr: KayoPointer) {
		this._wasm.deleteArrayDouble(ptr.byteOffset);
	}
}

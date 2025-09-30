import type { KayoPointer, KayoWASMInstance, KayoWASMMinecraftModule, MainModule } from "../c/KayoCorePP";
import { Kayo } from "./Kayo";
export type WasmPath = { map: boolean; val: string }[];
export type KayoAddress = number;

export default class WASMX {
	private _bindings: Map<number, Set<(v: any) => void>> = new Map();

	public kayoInstance: KayoWASMInstance;
	public minecraftModule: KayoWASMMinecraftModule;
	public imageData;
	private _KN;
	private _wasm: MainModule;

	public constructor(module: MainModule) {
		this._wasm = module;
		this._KN = module.KN;
		this.imageData = module.ImageData;
		this.kayoInstance = new module.KayoWASMInstance();
		this.minecraftModule = new module.KayoWASMMinecraftModule(this.kayoInstance);
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

	public getMemoryView(byteOffset: number, byteLength: number) {
		return new Uint8Array(this.heap.buffer, byteOffset, byteLength);
	}

	public getFloat64View(ptr: KayoPointer) {
		return new Float64Array(this.heap.buffer, ptr.byteOffset, ptr.byteLength / 8);
	}

	public deleteFloat64Array(ptr: KayoPointer) {
		this._wasm.deleteArrayDouble(ptr.byteOffset);
	}

	public toWasmPath(stateVariableURL: string, varMap?: { [key: string]: string }): WasmPath {
		const mapping = (s: string) => {
			return { map: s[0] == ":", val: s[0] == ":" || s[0] == "." ? s.substring(1) : s };
		};

		if (varMap) {
			for (const varName in varMap) stateVariableURL = stateVariableURL.replaceAll(varName, varMap[varName]);
		}
		return stateVariableURL.split(/(?=[.:])/).map(mapping);
	}

	public getWasmParentByPath(wasmPath: WasmPath) {
		let obj: any = this.kayoInstance.project;
		const max = wasmPath.length - 1;
		for (let i = 0; i < max; i++) {
			const segment = wasmPath[i];
			if (segment.map) obj = obj.get(segment.val);
			else obj = obj[segment.val];
		}
		return obj;
	}

	public getAddressFromPath(wasmPath: WasmPath): KayoAddress {
		const parent = this.getWasmParentByPath(wasmPath);
		const address = parent[(wasmPath.at(-1) as { val: string }).val + "_ptr"];
		const mapping = (v: { map: boolean; val: string }) => v.val;
		if (!address) console.error(`Address under "${wasmPath.map(mapping)}" is unknown`);
		return address;
	}

	public getValueByPath(wasmPath: WasmPath) {
		let obj: any = this.kayoInstance.project;
		for (const segment of wasmPath) {
			if (segment.map) obj = obj.get(segment.val);
			else obj = obj[segment.val];
		}
		return obj;
	}

	public setValueByPath(wasmPath: WasmPath, value: any) {
		const parent = this.getWasmParentByPath(wasmPath);
		parent[(wasmPath.at(-1) as { val: string }).val] = value;
	}

	public addChangeListener(address: KayoAddress, f: (v: any) => void) {
		let binding = this._bindings.get(address);
		if (!binding) {
			binding = new Set<(v: any) => void>();
			this._bindings.set(address, binding);
		}
		binding.add(f);
	}

	public addChangeListenerByPath(wasmPath: WasmPath, f: (v: any) => void, fireImmediately: boolean) {
		this.addChangeListener(this.getAddressFromPath(wasmPath), f);
		if (fireImmediately) f(this.getValueByPath(wasmPath));
	}

	public removeChangeListener(address: KayoAddress, f: (v: any) => void) {
		const bound = this._bindings.get(address);
		if (!bound) return;
		bound.delete(f);
	}

	public removeChangeListenerByPath(wasmPath: WasmPath, f: (v: any) => void) {
		this.removeChangeListener(this.getAddressFromPath(wasmPath), f);
	}

	protected dispatchUint32ToObserver(ptr: number, value: number) {
		const bound = this._bindings.get(ptr);
		if (!bound) return;
		for (const callback of bound) callback(value);
		((window as any).kayo as Kayo).project.fullRerender();
	}

	protected dispatchBooleanToObserver(ptr: number, value: boolean) {
		const bound = this._bindings.get(ptr);
		if (!bound) return;
		for (const callback of bound) callback(value);
		((window as any).kayo as Kayo).project.fullRerender();
	}

	protected dispatchStringToObserver(ptr: number, value: string) {
		const bound = this._bindings.get(ptr);
		if (!bound) return;
		for (const callback of bound) callback(value);
		((window as any).kayo as Kayo).project.fullRerender();
	}

	protected dispatchFixedPointToObserver(ptr: number) {
		const bound = this._bindings.get(ptr);
		if (!bound) return;
		const value = this.wasm.readFixedPointFromHeap(ptr);
		for (const callback of bound) callback(value);
		((window as any).kayo as Kayo).project.fullRerender();
	}
}

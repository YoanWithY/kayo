import type {
	KayoJSVCNumber,
	KayoJSVCString,
	KayoWASMInstance,
	KayoWASMMinecraftModule,
	MainModule,
	VectorUInt8,
} from "../c/KayoCorePP";

export type WasmPath = string[][];

export default class WASMX {
	private _bindings: Map<number, { url: WasmPath; callbacks: Set<(v: string) => void> }> = new Map();

	public Number;
	public kayoInstance: KayoWASMInstance;
	public minecraftModule: KayoWASMMinecraftModule;
	public imageData;
	private module: MainModule;

	public constructor(module: MainModule) {
		this.module = module;
		this.Number = module.KayoNumber;
		this.getBufferView = module.getBufferView;
		this.imageData = module.ImageData;
		this.kayoInstance = new module.KayoWASMInstance();
		this.minecraftModule = new module.KayoWASMMinecraftModule(this.kayoInstance);
	}

	public getBufferView(vector: VectorUInt8) {
		return this.module.getBufferView(vector);
	}

	public toWasmPath(stateVariableURL: string, variables: any = {}): WasmPath {
		return stateVariableURL.split(".").map((val: string) => {
			const pathPart = val.split(":");
			for (let i = 1; i < pathPart.length; i++) {
				const variableSubstitution = variables[pathPart[i]];
				if (variableSubstitution === undefined) {
					console.error(`WasmPath variable "${pathPart[i]}" is no known variable.`);
				} else {
					pathPart[i] = variableSubstitution;
				}
			}
			return pathPart;
		});
	}

	public getModelReference(wasmPath: WasmPath): KayoJSVCNumber | KayoJSVCString {
		let obj: any = this.kayoInstance.project;
		for (const pathSegment of wasmPath) {
			obj = obj[pathSegment[0]];
			for (let i = 1; i < pathSegment.length; i++) obj = obj.get(pathSegment[i]);
		}
		return obj;
	}

	public getModelValue(wasmPath: WasmPath): string {
		return this.getModelReference(wasmPath).getValue();
	}

	public setModelValue(wasmPath: WasmPath, value: string): void {
		this.getModelReference(wasmPath).setValue(value);
	}

	public addChangeListener(wasmPath: WasmPath, f: (v: string) => void, fireImmediately = true) {
		const jsvc = this.getModelReference(wasmPath);
		const observationID = jsvc.getObservationID();

		let binding = this._bindings.get(observationID);
		if (!binding) {
			binding = { url: wasmPath, callbacks: new Set<(v: string) => void>() };
			this._bindings.set(observationID, binding);
		}
		binding.callbacks.add(f);
		if (fireImmediately) f(jsvc.getValue());
	}

	public removeChangeListener(wasmPath: WasmPath, f: (v: string) => void) {
		const jsvc = this.getModelReference(wasmPath);
		const observationID = jsvc.getObservationID();
		const bound = this._bindings.get(observationID);
		if (!bound) return;
		bound.callbacks.delete(f);
	}

	public vcDispatch(id: number) {
		const bound = this._bindings.get(id);
		if (!bound) return;
		if (bound.callbacks.size === 0) return;
		const value = this.getModelReference(bound.url).getValue();
		for (const callback of bound.callbacks) callback(value);
	}
}

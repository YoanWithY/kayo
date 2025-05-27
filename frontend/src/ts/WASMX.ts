import type {
	KayoJSVCNumber,
	KayoJSVCString,
	KayoWASMInstance,
	KayoWASMMinecraftModule,
	MainModule,
} from "../c/KayoCorePP";

export interface VcBindable {
	wasmPath: string[];
	setUiValue(value: string): void;
}

export default class WASMX {
	private _bindings: Map<number, { url: string[]; bindables: Set<VcBindable> }> = new Map();

	Number;
	kayoInstance: KayoWASMInstance;
	minecraftModule: KayoWASMMinecraftModule;
	constructor(module: MainModule) {
		this.Number = module.KayoNumber;
		this.kayoInstance = new module.KayoWASMInstance();
		this.minecraftModule = new module.KayoWASMMinecraftModule(this.kayoInstance);
	}

	public getModelReference(wasmPath: string[]): KayoJSVCNumber | KayoJSVCString {
		let obj: any = this.kayoInstance.project;
		for (const name of wasmPath) obj = obj[name];
		return obj;
	}

	public vcBind(vcBindable: VcBindable) {
		const jsvc = this.getModelReference(vcBindable.wasmPath);
		const observationID = jsvc.getObservationID();

		let bound = this._bindings.get(observationID);
		if (!bound) {
			bound = { url: vcBindable.wasmPath, bindables: new Set<VcBindable>() };
			this._bindings.set(observationID, bound);
		}
		bound.bindables.add(vcBindable);
		vcBindable.setUiValue(jsvc.getValue());
	}

	public vcUnbind(vcBindable: VcBindable) {
		const jsvc = this.getModelReference(vcBindable.wasmPath);
		const observationID = jsvc.getObservationID();
		let bound = this._bindings.get(observationID);
		if (!bound) return;
		bound.bindables.delete(vcBindable);
	}

	public vcDispatch(id: number) {
		const bound = this._bindings.get(id);
		if (!bound) return;
		if (bound.bindables.size === 0) return;
		const value = this.getModelReference(bound.url).getValue();
		for (const vcBindable of bound.bindables) vcBindable.setUiValue(value);
	}
}

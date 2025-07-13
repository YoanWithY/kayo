import { Kayo } from "../../Kayo";
import WASMX, { WasmPath } from "../../WASMX";
import { buildUIElement, MarkUneffectiveEntry } from "../ui";

export default class Grid2Col extends HTMLElement {
	private _wasmx!: WASMX;
	private _uneffectiveIfAny!: MarkUneffectiveEntry[];
	private _internals: ElementInternals;
	private _stateWasmPathVariables: any;
	private _additionalCallbacks: { path: WasmPath; callback: (v: string) => void }[] = [];

	public constructor() {
		super();
		this._internals = this.attachInternals();
	}

	protected connectedCallback() {
		for (const entry of this._additionalCallbacks) this._wasmx.addChangeListener(entry.path, entry.callback);
	}

	protected disconnectedCallback() {
		for (const entry of this._additionalCallbacks) this._wasmx.removeChangeListener(entry.path, entry.callback);
	}

	public setMarkUneffective(markUneffective: boolean) {
		if (markUneffective) this._internals.states.add("uneffective");
		else this._internals.states.delete("uneffective");
	}

	private _checkDisablingCallback = () => {
		this.setMarkUneffective(this._checkMarkUneffective());
	};

	private _checkMarkUneffective() {
		for (const entry of this._uneffectiveIfAny) {
			const path = this._wasmx.toWasmPath(entry.stateVariableURL, this._stateWasmPathVariables);
			const val = this._wasmx.getModelReference(path).getValue();
			for (let compValue of entry.anyOf) {
				if (typeof compValue == "number") compValue = this._wasmx.Number.fromDouble(compValue);
				if (val == compValue) return true;
			}
		}
		return false;
	}

	public static createUIElement(win: Window, kayo: Kayo, obj: any, variables?: any) {
		const p = win.document.createElement(this.getDomClass()) as Grid2Col;
		p._wasmx = kayo.wasmx;
		p._stateWasmPathVariables = variables;

		p._uneffectiveIfAny = obj.uneffectiveIfAny;

		if (p._uneffectiveIfAny !== undefined) {
			for (const entry of obj.uneffectiveIfAny) {
				const path = kayo.wasmx.toWasmPath(entry.stateVariableURL, variables);
				p._additionalCallbacks.push({ path: path, callback: p._checkDisablingCallback });
			}
		}

		const children = obj.children;
		if (children === undefined) return p;
		for (const child of children) p.appendChild(buildUIElement(win, kayo, child, variables));
		return p;
	}

	public static getDomClass() {
		return "grid-2col";
	}
}

import { Kayo } from "../../Kayo";
import WASMX, { KayoJSVC, WasmValue } from "../../WASMX";
import { buildUIElement, MarkUneffectiveEntry } from "../ui";

export default class Grid2Col extends HTMLElement {
	private _wasmx!: WASMX;
	private _uneffectiveIfAny!: MarkUneffectiveEntry[];
	private _internals: ElementInternals;
	private _stateWasmPathVariables: any;
	private _additionalCallbacks: { jsvc: KayoJSVC; callback: (v: WasmValue) => void }[] = [];

	public constructor() {
		super();
		this._internals = this.attachInternals();
	}

	protected connectedCallback() {
		for (const entry of this._additionalCallbacks) this._wasmx.addChangeListener(entry.jsvc, entry.callback, true);
	}

	protected disconnectedCallback() {
		for (const entry of this._additionalCallbacks) this._wasmx.removeChangeListener(entry.jsvc, entry.callback);
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
			const val = this._wasmx.getModelReference(path).getValue().toString();
			for (let compValue of entry.anyOf) {
				if (typeof compValue == "number") compValue = this._wasmx.KN.fromDouble(compValue).toString();
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
				p._additionalCallbacks.push({
					jsvc: kayo.wasmx.getModelReference(kayo.wasmx.toWasmPath(entry.stateVariableURL, variables)),
					callback: p._checkDisablingCallback,
				});
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

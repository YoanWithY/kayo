import { Kayo } from "../../Kayo";
import WASMX, { WasmPath } from "../../WASMX";
import { buildUIElement, MarkUneffectiveEntry } from "../ui";

export default class Grid2Col extends HTMLElement {
	private _wasmx!: WASMX;
	private _varMap?: { [key: string]: string };
	private _uneffectiveIfAny!: MarkUneffectiveEntry[];
	private _internals: ElementInternals;
	private _additionalCallbacks: { path: WasmPath; callback: (v: any) => void }[] = [];

	public constructor() {
		super();
		this._internals = this.attachInternals();
	}

	protected connectedCallback() {
		for (const entry of this._additionalCallbacks)
			this._wasmx.addChangeListenerByPath(entry.path, entry.callback, true);
	}

	protected disconnectedCallback() {
		for (const entry of this._additionalCallbacks)
			this._wasmx.removeChangeListenerByPath(entry.path, entry.callback);
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
			const path = this._wasmx.toWasmPath(entry.stateVariableURL, this._varMap);
			const val = this._wasmx.getValueByPath(path);
			for (const compValue of entry.anyOf) if (val == compValue) return true;
		}
		return false;
	}

	public static createUIElement(win: Window, kayo: Kayo, obj: any, varMap?: { [key: string]: string }) {
		const p = win.document.createElement(this.getDomClass()) as Grid2Col;
		p._varMap = varMap;
		p._wasmx = kayo.wasmx;
		p._uneffectiveIfAny = obj.uneffectiveIfAny;

		if (p._uneffectiveIfAny !== undefined) {
			for (const entry of obj.uneffectiveIfAny) {
				p._additionalCallbacks.push({
					path: kayo.wasmx.toWasmPath(entry.stateVariableURL, varMap),
					callback: p._checkDisablingCallback,
				});
			}
		}

		const children = obj.children;
		if (children === undefined) return p;
		for (const child of children) p.appendChild(buildUIElement(win, kayo, child, varMap));
		return p;
	}

	public static getDomClass() {
		return "grid-2col";
	}
}

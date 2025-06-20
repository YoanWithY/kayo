import { Kayo } from "../../Kayo";
import WASMX, { WasmPath } from "../../WASMX";
import Tooltip, { SerialTooltip } from "./Tooltip";

export default class Checkbox extends HTMLElement {
	private _wasmx!: WASMX;
	private _stateWasmPath!: WasmPath;
	private _internals: ElementInternals;

	constructor() {
		super();
		this._internals = this.attachInternals();
	}

	clickCallback = (_: MouseEvent) => {
		this._wasmx.setModelValue(this._stateWasmPath, this._internals.states.has("checked") ? "false" : "true");
	};

	stateChangeCallback = (value: string) => {
		if (value == "true") {
			this._internals.states.add("checked");
			this.textContent = "Yes";
		} else {
			this._internals.states.delete("checked");
			this.textContent = "No";
		}
	};

	connectedCallback() {
		this.addEventListener("click", this.clickCallback);
		this._wasmx.addChangeListener(this._stateWasmPath, this.stateChangeCallback);
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.clickCallback);
		this._wasmx.removeChangeListener(this._stateWasmPath, this.stateChangeCallback);
	}

	static createUIElement(win: Window, kayo: Kayo, obj: any, variables?: any): Checkbox {
		const p = win.document.createElement(this.getDomClass()) as Checkbox;
		if (obj.tooltip) Tooltip.register(win, obj.tooltip as SerialTooltip, p, obj);
		p._wasmx = kayo.wasmx;
		p._stateWasmPath = kayo.wasmx.toWasmPath(obj.stateVariableURL, variables);
		return p;
	}

	static getDomClass(): string {
		return "check-box";
	}
}

import { Kayo } from "../../Kayo";
import Tooltip, { SerialTooltip } from "./Tooltip";
import UIVariableComponent from "./UIComponent";

export default class Checkbox extends UIVariableComponent {
	static getDomClass(): string {
		return "check-box";
	}
	private _internals: ElementInternals;

	constructor() {
		super();
		this._internals = this.attachInternals();
	}

	setUiValue(value: string) {
		if (value == "true") {
			this._internals.states.add("checked");
			this.textContent = "Yes";
		} else {
			this._internals.states.delete("checked");
			this.textContent = "No";
		}
	}

	clickCallback = (_: MouseEvent) => {
		this.setModelValue(this._internals.states.has("checked") ? "false" : "true");
	};

	connectedCallback() {
		this.addEventListener("click", this.clickCallback);
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.clickCallback);
	}

	static createUIElement(win: Window, kayo: Kayo, obj: any): Checkbox {
		const p = win.document.createElement(this.getDomClass()) as Checkbox;
		p.wasmx = kayo.wasmx;
		if (obj.tooltip) Tooltip.register(win, obj.tooltip as SerialTooltip, p, obj.stateVariableURL);
		p.bind(obj.stateVariableURL);
		return p;
	}
}

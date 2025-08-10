import { Kayo } from "../../Kayo";
import WASMX from "../../WASMX";
import { IconedToggleButton } from "./IconedToggleButton";
import Tooltip, { SerialTooltip } from "./Tooltip";

import emptyIcon from "../../../svg/empty.svg?raw";
import checkIcon from "../../../svg/check.svg?raw";
import { KayoJSVCString } from "../../../c/KayoCorePP";

export default class Checkbox extends IconedToggleButton {
	private _wasmx!: WASMX;
	private _stateJSVC!: KayoJSVCString;
	private _internals: ElementInternals;

	public constructor() {
		super();
		this._internals = this.attachInternals();
	}

	private _stateChangeCallback = (value: string) => {
		if (value == "true") {
			this._internals.states.add("checked");
			this.setStateUIOnly(1);
		} else {
			this._internals.states.delete("checked");
			this.setStateUIOnly(0);
		}
	};

	protected connectedCallback() {
		super.connectedCallback();
		this._wasmx.addChangeListener(this._stateJSVC, this._stateChangeCallback, true);
	}

	protected disconnectedCallback() {
		super.disconnectedCallback();
		this._wasmx.removeChangeListener(this._stateJSVC, this._stateChangeCallback);
	}

	public static createUIElement(win: Window, kayo: Kayo, obj: any, variables?: any): Checkbox {
		const p = win.document.createElement(this.getDomClass()) as Checkbox;
		if (obj.tooltip) Tooltip.register(win, obj.tooltip as SerialTooltip, p, obj);
		p._wasmx = kayo.wasmx;

		p._stateJSVC = kayo.wasmx.getModelReference(kayo.wasmx.toWasmPath(obj.stateVariableURL, variables));
		p._state = 0;
		p._states = [
			{
				svgIcon: emptyIcon,
				callback: () => p._stateJSVC.setValue("false"),
			},
			{
				svgIcon: checkIcon,
				callback: () => p._stateJSVC.setValue("true"),
			},
		];
		return p;
	}

	public static getDomClass(): string {
		return "check-box";
	}
}

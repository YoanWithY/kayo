import { Kayo } from "../../Kayo";
import WASMX, { WasmPath } from "../../WASMX";
import { IconedToggleButton } from "./IconedToggleButton";
import Tooltip, { SerialTooltip } from "./Tooltip";

import emptyIcon from "../../../svg/empty.svg?raw";
import checkIcon from "../../../svg/check.svg?raw";

export default class Checkbox extends IconedToggleButton {
	private _wasmx!: WASMX;
	private _stateWasmPath!: WasmPath;
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
		this._wasmx.addChangeListener(this._stateWasmPath, this._stateChangeCallback);
	}

	protected disconnectedCallback() {
		super.disconnectedCallback();
		this._wasmx.removeChangeListener(this._stateWasmPath, this._stateChangeCallback);
	}

	public static createUIElement(win: Window, kayo: Kayo, obj: any, variables?: any): Checkbox {
		const p = win.document.createElement(this.getDomClass()) as Checkbox;
		if (obj.tooltip) Tooltip.register(win, obj.tooltip as SerialTooltip, p, obj);
		p._wasmx = kayo.wasmx;
		p._stateWasmPath = kayo.wasmx.toWasmPath(obj.stateVariableURL, variables);
		p._state = 0;
		p._states = [
			{
				svgIcon: emptyIcon,
				callback: () => p._wasmx.setModelValue(p._stateWasmPath, "false"),
			},
			{
				svgIcon: checkIcon,
				callback: () => p._wasmx.setModelValue(p._stateWasmPath, "true"),
			},
		];
		return p;
	}

	public static getDomClass(): string {
		return "check-box";
	}
}

import { Kayo } from "../../Kayo";
import WASMX, { WasmPath } from "../../WASMX";
import { MarkUneffectiveEntry } from "../ui";
import Tooltip, { SerialTooltip } from "./Tooltip";

export type SelectOptionValue = { value: any; text: string };
interface ISelectBox {
	setOption: (optionValue: SelectOptionValue) => void;
}

export class StateSelectBox extends HTMLElement implements ISelectBox {
	private _win!: Window;
	private _wasmx!: WASMX;
	private _stateWasmPath: any;
	private _uneffectiveIfAny!: MarkUneffectiveEntry[];
	private callbacks: { path: WasmPath; callback: (v: any) => void }[] = [];
	private _optionWrapper!: SelectOptionWrapper;
	private _internals: ElementInternals;
	private _valueNameMap: Map<string, string> = new Map();

	public constructor() {
		super();
		this._internals = this.attachInternals();
		this.onclick = () => {
			this._win.document.body.appendChild(this._optionWrapper);
			const rect = this.getBoundingClientRect();
			this._optionWrapper.style.top = rect.bottom + "px";
			this._optionWrapper.style.left = rect.left + "px";
			this._optionWrapper.style.width = rect.width + "px";
			this._optionWrapper._internals.states.add("open-down");
			this._internals.states.add("open-down");
			this._optionWrapper.updateSelectedState(this.textContent as string);
			this._win.addEventListener("mousedown", this._hidingClosure);
		};
	}

	private _hidingClosure = () => {
		this._win.document.body.removeChild(this._optionWrapper);
		this._internals.states.delete("open-down");
		this._optionWrapper._internals.states.delete("open-down");
		this._win.removeEventListener("mousedown", this._hidingClosure);
	};

	public setOption(optionValue: SelectOptionValue) {
		this._wasmx.setValueByPath(this._stateWasmPath, optionValue.value);
		this._hidingClosure();
	}

	private addOption(win: Window, optionValue: SelectOptionValue) {
		const selectOption = SelectOption.createSelectOption(win, optionValue, this);
		this._optionWrapper.appendChild(selectOption);
		this._valueNameMap.set(optionValue.value.toString(), optionValue.text);
	}

	protected connectedCallback() {
		for (const call of this.callbacks) this._wasmx.addChangeListenerByPath(call.path, call.callback, true);
	}

	protected disconnectedCallback() {
		for (const call of this.callbacks) this._wasmx.removeChangeListenerByPath(call.path, call.callback);
	}

	private _stateChangeCallback = (wasmValue: any) => {
		this.textContent = this._valueNameMap.get(wasmValue.toString()) as string;
	};

	private _checkMarkUneffective() {
		for (const entry of this._uneffectiveIfAny) {
			const path = this._wasmx.toWasmPath(entry.stateVariableURL);
			const val = this._wasmx.getValueByPath(path);
			for (const compValue of entry.anyOf) if (val == compValue) return true;
		}
		return false;
	}

	public setMarkUneffective(markUneffective: boolean) {
		if (markUneffective) this._internals.states.add("uneffective");
		else this._internals.states.delete("uneffective");
	}

	private _checkDisablingCallback = () => {
		this.setMarkUneffective(this._checkMarkUneffective());
	};

	public static createUIElement(win: Window, kayo: Kayo, obj: any): StateSelectBox {
		const selectBox = win.document.createElement(this.getDomClass()) as StateSelectBox;
		selectBox._win = win;
		selectBox._optionWrapper = SelectOptionWrapper.createSelectOptionWrapper(win);
		selectBox._wasmx = kayo.wasmx;
		selectBox._stateWasmPath = kayo.wasmx.toWasmPath(obj.stateVariableURL);

		selectBox._uneffectiveIfAny = obj.uneffectiveIfAny;
		selectBox.callbacks.push({ path: selectBox._stateWasmPath, callback: selectBox._stateChangeCallback });

		if (selectBox._uneffectiveIfAny !== undefined) {
			for (const entry of obj.uneffectiveIfAny) {
				selectBox.callbacks.push({
					path: kayo.wasmx.toWasmPath(entry.stateVariableURL),
					callback: selectBox._checkDisablingCallback,
				});
			}
		}

		const options = obj.options;
		for (const option of options as SelectOptionValue[]) {
			selectBox.addOption(win, option);
		}

		if (obj.tooltip) Tooltip.register(win, obj.tooltip as SerialTooltip, selectBox, obj);

		return selectBox;
	}

	public static getDomClass() {
		return "state-select-box";
	}
}

export class SelectOptionWrapper extends HTMLElement {
	public _internals: ElementInternals = this.attachInternals();

	public static createSelectOptionWrapper(win: Window): SelectOptionWrapper {
		return win.document.createElement("select-option-wrapper") as SelectOptionWrapper;
	}

	public updateSelectedState(activeText: string) {
		for (const selectionOption of this.children) {
			if (selectionOption instanceof SelectOption) {
				if (selectionOption.optionValue.text === activeText) {
					selectionOption._internals.states.add("selected");
				} else {
					selectionOption._internals.states.delete("selected");
				}
			}
		}
	}
}

export class SelectOption extends HTMLElement {
	public optionValue!: SelectOptionValue;
	private _selectBox!: ISelectBox;
	public _internals = this.attachInternals();
	public constructor() {
		super();
		this.onclick = () => {
			this._selectBox.setOption(this.optionValue);
		};
		this.onmousedown = (e) => {
			e.stopImmediatePropagation();
		};
	}
	public static createSelectOption(win: Window, optionValue: SelectOptionValue, selectBox: ISelectBox): SelectOption {
		const selectOption = win.document.createElement(this.getDomClass()) as SelectOption;
		selectOption.optionValue = optionValue;
		selectOption.textContent = optionValue.text;
		selectOption._selectBox = selectBox;
		return selectOption;
	}

	public static getDomClass() {
		return "select-option";
	}
}

export class SelectBox extends HTMLElement {
	private _optionWrapper!: SelectOptionWrapper;
	private _internals: ElementInternals;
	private _valueNameMap: Map<string, string> = new Map();
	private _win!: Window;

	public constructor() {
		super();
		this._internals = this.attachInternals();
		this.onclick = (_) => {
			this._win.document.body.appendChild(this._optionWrapper);
			const rect = this.getBoundingClientRect();
			this._optionWrapper.style.top = rect.bottom + "px";
			this._optionWrapper.style.left = rect.left + "px";
			this._optionWrapper.style.width = rect.width + "px";
			this._optionWrapper._internals.states.add("open-down");
			this._internals.states.add("open-down");
			this._optionWrapper.updateSelectedState(this.textContent as string);
			this._win.addEventListener("mousedown", this._hidingClosure);
		};
	}

	private _hidingClosure = () => {
		this._win.document.body.removeChild(this._optionWrapper);
		this._internals.states.delete("open-down");
		this._optionWrapper._internals.states.delete("open-down");
		this._win.removeEventListener("mousedown", this._hidingClosure);
	};

	public onValueChange = (_: SelectOptionValue) => {};

	public setOption(optionValue: SelectOptionValue) {
		this.textContent = optionValue.text;
		this._hidingClosure();
		this.onValueChange(optionValue);
	}

	public addOption(win: Window, optionValue: SelectOptionValue) {
		const selectOption = SelectOption.createSelectOption(win, optionValue, this);
		this._optionWrapper.appendChild(selectOption);
		this._valueNameMap.set(optionValue.value.toString(), optionValue.text);
	}

	public static createUIElement(win: Window): SelectBox {
		const selectBox = win.document.createElement(this.getDomClass()) as SelectBox;
		selectBox._win = win;
		selectBox._optionWrapper = SelectOptionWrapper.createSelectOptionWrapper(win);
		return selectBox;
	}

	public static getDomClass() {
		return "select-box";
	}
}

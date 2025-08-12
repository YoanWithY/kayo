import { Kayo } from "../../Kayo";
import WASMX, { KayoJSVC, WasmValue } from "../../WASMX";
import { MarkUneffectiveEntry } from "../ui";
import Tooltip, { SerialTooltip } from "./Tooltip";

export type SelectOptionValue = { value: WasmValue; text: string };
interface ISelectBox {
	setOption: (optionValue: SelectOptionValue) => void;
}

export class StateSelectBox extends HTMLElement implements ISelectBox {
	private _win!: Window;
	private _wasmx!: WASMX;
	private _stateJSVC!: KayoJSVC;
	private _stateWasmPathVariables: any;
	private _uneffectiveIfAny!: MarkUneffectiveEntry[];
	private _additionalCallbacks: { jsvc: KayoJSVC; callback: (v: WasmValue) => void }[] = [];
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
		this._stateJSVC.setValue(optionValue.value as any);
		this._hidingClosure();
	}

	private addOption(win: Window, optionValue: SelectOptionValue) {
		const selectOption = SelectOption.createSelectOption(win, optionValue, this);
		this._optionWrapper.appendChild(selectOption);
		this._valueNameMap.set(optionValue.value.toString(), optionValue.text);
	}

	private _stateChangeCallback = (wasmValue: WasmValue) => {
		this.textContent = this._valueNameMap.get(wasmValue.toString()) as string;
	};

	protected connectedCallback() {
		this._wasmx.addChangeListener(this._stateJSVC, this._stateChangeCallback, true);
		for (const entry of this._additionalCallbacks) this._wasmx.addChangeListener(entry.jsvc, entry.callback, true);
	}

	protected disconnectedCallback() {
		this._wasmx.removeChangeListener(this._stateJSVC, this._stateChangeCallback);
		for (const entry of this._additionalCallbacks) this._wasmx.removeChangeListener(entry.jsvc, entry.callback);
	}

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

	public setMarkUneffective(markUneffective: boolean) {
		if (markUneffective) this._internals.states.add("uneffective");
		else this._internals.states.delete("uneffective");
	}

	private _checkDisablingCallback = () => {
		this.setMarkUneffective(this._checkMarkUneffective());
	};

	public static createUIElement(win: Window, kayo: Kayo, obj: any, variables?: any): StateSelectBox {
		const selectBox = win.document.createElement(this.getDomClass()) as StateSelectBox;
		selectBox._win = win;
		selectBox._optionWrapper = SelectOptionWrapper.createSelectOptionWrapper(win);
		selectBox._wasmx = kayo.wasmx;
		selectBox._stateJSVC = kayo.wasmx.getModelReference(kayo.wasmx.toWasmPath(obj.stateVariableURL, variables));
		selectBox._stateWasmPathVariables = variables;

		selectBox._uneffectiveIfAny = obj.uneffectiveIfAny;

		if (selectBox._uneffectiveIfAny !== undefined) {
			for (const entry of obj.uneffectiveIfAny) {
				selectBox._additionalCallbacks.push({
					jsvc: kayo.wasmx.getModelReference(kayo.wasmx.toWasmPath(entry.stateVariableURL, variables)),
					callback: selectBox._checkDisablingCallback,
				});
			}
		}

		const options = obj.options;
		for (const option of options as SelectOptionValue[]) {
			if (typeof option.value == "number") {
				option.value = kayo.wasmx.KN.fromDouble(option.value);
			}
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

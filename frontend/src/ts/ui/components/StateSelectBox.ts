import { Kayo } from "../../Kayo";
import WASMX, { WasmPath } from "../../WASMX";
import { MarkUneffectiveEntry } from "../ui";
import Tooltip, { SerialTooltip } from "./Tooltip";

interface ISelectBox {
	setOption: (optionValue: SelectOptionValue) => void;
}

export type SelectOptionValue = { value: string; text: string };
export class StateSelectBox extends HTMLElement implements ISelectBox {
	private _win!: Window;
	private _wasmx!: WASMX;
	private _stateWasmPath!: WasmPath;
	private _stateWasmPathVariables: any;
	private _uneffectiveIfAny!: MarkUneffectiveEntry[];
	private _additionalCallbacks: { path: WasmPath; callback: (v: string) => void }[] = [];
	private _optionWrapper!: SelectOptionWrapper;
	private _internals: ElementInternals;
	private _valueNameMap: Map<string, string> = new Map();

	constructor() {
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
			this._win.addEventListener("mousedown", this.hidingClosure);
		};
	}

	hidingClosure = () => {
		this._win.document.body.removeChild(this._optionWrapper);
		this._internals.states.delete("open-down");
		this._optionWrapper._internals.states.delete("open-down");
		this._win.removeEventListener("mousedown", this.hidingClosure);
	};

	setOption(optionValue: SelectOptionValue) {
		this._wasmx.setModelValue(this._stateWasmPath, optionValue.value);
		this.hidingClosure();
	}

	private addOption(win: Window, optionValue: SelectOptionValue) {
		const selectOption = SelectOption.createSelectOption(win, optionValue, this);
		this._optionWrapper.appendChild(selectOption);
		this._valueNameMap.set(optionValue.value, optionValue.text);
	}

	stateChangeCallback = (wasmValue: string) => {
		this.textContent = this._valueNameMap.get(wasmValue) as string;
	};

	connectedCallback() {
		this._wasmx.addChangeListener(this._stateWasmPath, this.stateChangeCallback);
		for (const entry of this._additionalCallbacks) this._wasmx.addChangeListener(entry.path, entry.callback);
	}

	disconnectedCallback() {
		this._wasmx.removeChangeListener(this._stateWasmPath, this.stateChangeCallback);
		for (const entry of this._additionalCallbacks) this._wasmx.removeChangeListener(entry.path, entry.callback);
	}

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

	public setMarkUneffective(markUneffective: boolean) {
		if (markUneffective) this._internals.states.add("uneffective");
		else this._internals.states.delete("uneffective");
	}

	checkDisablingCallback = () => {
		this.setMarkUneffective(this._checkMarkUneffective());
	};

	public static createUIElement(win: Window, kayo: Kayo, obj: any, variables?: any): StateSelectBox {
		const selectBox = win.document.createElement(this.getDomClass()) as StateSelectBox;
		selectBox._win = win;
		selectBox._optionWrapper = SelectOptionWrapper.createSelectOptionWrapper(win);
		selectBox._wasmx = kayo.wasmx;
		selectBox._stateWasmPath = kayo.wasmx.toWasmPath(obj.stateVariableURL, variables);
		selectBox._stateWasmPathVariables = variables;

		selectBox._uneffectiveIfAny = obj.uneffectiveIfAny;

		if (selectBox._uneffectiveIfAny !== undefined) {
			for (const entry of obj.uneffectiveIfAny) {
				const path = kayo.wasmx.toWasmPath(entry.stateVariableURL, variables);
				selectBox._additionalCallbacks.push({ path: path, callback: selectBox.checkDisablingCallback });
			}
		}

		const options = obj.options;
		for (const option of options as SelectOptionValue[]) {
			if (typeof option.value == "number") {
				option.value = kayo.wasmx.Number.fromDouble(option.value);
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
	_internals: ElementInternals = this.attachInternals();

	static createSelectOptionWrapper(win: Window): SelectOptionWrapper {
		return win.document.createElement("select-option-wrapper") as SelectOptionWrapper;
	}

	updateSelectedState(activeText: string) {
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
	optionValue!: SelectOptionValue;
	selectBox!: ISelectBox;
	_internals = this.attachInternals();
	constructor() {
		super();
		this.onclick = () => {
			this.selectBox.setOption(this.optionValue);
		};
		this.onmousedown = (e) => {
			e.stopImmediatePropagation();
		};
	}
	static createSelectOption(win: Window, optionValue: SelectOptionValue, selectBox: ISelectBox): SelectOption {
		const selectOption = win.document.createElement(this.getDomClass()) as SelectOption;
		selectOption.optionValue = optionValue;
		selectOption.textContent = optionValue.text;
		selectOption.selectBox = selectBox;
		return selectOption;
	}

	static getDomClass() {
		return "select-option";
	}
}

export class SelectBox extends HTMLElement {
	private _optionWrapper!: SelectOptionWrapper;
	private _internals: ElementInternals;
	private _valueNameMap: Map<string, string> = new Map();
	private _win!: Window;

	constructor() {
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
			this._win.addEventListener("mousedown", this.hidingClosure);
		};
	}

	hidingClosure = () => {
		this._win.document.body.removeChild(this._optionWrapper);
		this._internals.states.delete("open-down");
		this._optionWrapper._internals.states.delete("open-down");
		this._win.removeEventListener("mousedown", this.hidingClosure);
	};

	onValueChange = (value: SelectOptionValue) => {
		value;
	};

	setOption(optionValue: SelectOptionValue) {
		this.textContent = optionValue.text;
		this.hidingClosure();
		this.onValueChange(optionValue);
	}

	addOption(win: Window, optionValue: SelectOptionValue) {
		const selectOption = SelectOption.createSelectOption(win, optionValue, this);
		this._optionWrapper.appendChild(selectOption);
		this._valueNameMap.set(optionValue.value, optionValue.text);
	}

	public static createUIElement(win: Window): SelectBox {
		const selectBox = win.document.createElement(this.getDomClass()) as SelectBox;
		selectBox._win = win;
		selectBox._optionWrapper = SelectOptionWrapper.createSelectOptionWrapper(win);
		return selectBox;
	}

	static getDomClass() {
		return "select-box";
	}
}

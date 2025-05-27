import { Kayo } from "../../Kayo";
import UIVariableComponent from "./UIComponent";

interface ISelectBox {
	setOption: (optionValue: SelectOptionValue) => void;
}

export type SelectOptionValue = { value: string; text: string };
export class StateSelectBox extends UIVariableComponent implements ISelectBox {
	private _win!: Window;
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
		this.setModelValue(optionValue.value);
		this.hidingClosure();
	}

	private addOption(win: Window, optionValue: SelectOptionValue) {
		const selectOption = SelectOption.createSelectOption(win, optionValue, this);
		this._optionWrapper.appendChild(selectOption);
		this._valueNameMap.set(optionValue.value, optionValue.text);
	}

	setUiValue(wasmValue: string): void {
		this.textContent = this._valueNameMap.get(wasmValue) as string;
	}

	public static createUIElement(win: Window, kayo: Kayo, obj: any): StateSelectBox {
		const selectBox = win.document.createElement(this.getDomClass()) as StateSelectBox;
		selectBox.wasmx = kayo.wasmx;
		selectBox._win = win;
		selectBox._optionWrapper = SelectOptionWrapper.createSelectOptionWrapper(win);
		const options = obj.options;
		for (const option of options as SelectOptionValue[]) {
			if (typeof option.value == "number") {
				option.value = kayo.wasmx.Number.fromDouble(option.value);
			}
			selectBox.addOption(win, option);
		}
		selectBox.bind(obj.stateVariableURL);
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

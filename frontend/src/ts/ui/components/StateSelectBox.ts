import { PageContext } from "../../PageContext";
import UIVariableComponent from "./UIComponent";

interface ISelectBox<T> {
	setOption: (optionValue: SelectOptionValue<T>) => void;
}

export type SelectOptionValue<T> = { value: T, text: string };
export class StateSelectBox<T> extends UIVariableComponent<any> implements ISelectBox<T> {
	private _optionWrapper!: SelectOptionWrapper;
	private _internals: ElementInternals;
	private _valueNameMap: Map<T, string> = new Map();
	private _win!: Window;
	private _value!: T;

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
			this._optionWrapper.updateSelectedState(this._valueNameMap.get(this._value) as string);
			this._win.addEventListener("mousedown", this.hidingClosure);
		};
	}

	hidingClosure = () => {
		this._win.document.body.removeChild(this._optionWrapper);
		this._internals.states.delete("open-down");
		this._optionWrapper._internals.states.delete("open-down");
		this._win.removeEventListener("mousedown", this.hidingClosure);
	};

	setOption(optionValue: SelectOptionValue<T>) {
		this.stateVariable.value = optionValue.value;
		this.hidingClosure();
	}

	private addOption(win: Window, optionValue: SelectOptionValue<T>) {
		const selectOption = SelectOption.createSelectOption(win, optionValue, this);
		this._optionWrapper.appendChild(selectOption);
		this._valueNameMap.set(optionValue.value, optionValue.text);
	}

	setValue(value: any): void {
		this._value = value;
		this.textContent = this._valueNameMap.get(this._value) as string;
	}

	public static createUIElement<T>(win: Window, pageContext: PageContext, obj: any): StateSelectBox<T> {
		const selectBox = win.document.createElement(this.getDomClass()) as StateSelectBox<T>;
		selectBox._win = win;
		selectBox._optionWrapper = SelectOptionWrapper.createSelectOptionWrapper(win);
		const options = obj.options;
		for (const option of options)
			selectBox.addOption(win, option as SelectOptionValue<T>);
		const stateVariable = pageContext.project.getVariableFromURL(obj.stateVariableURL);
		if (stateVariable)
			selectBox.bind(stateVariable);
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

export class SelectOption<T> extends HTMLElement {
	optionValue!: SelectOptionValue<T>;
	selectBox!: ISelectBox<T>;
	_internals = this.attachInternals();
	constructor() {
		super();
		this.onclick = () => {
			this.selectBox.setOption(this.optionValue);
		};
		this.onmousedown = (e) => {
			e.stopImmediatePropagation();
		}
	}
	static createSelectOption<T>(win: Window, optionValue: SelectOptionValue<T>, selectBox: ISelectBox<T>): SelectOption<T> {
		const selectOption = win.document.createElement(this.getDomClass()) as SelectOption<T>;
		selectOption.optionValue = optionValue;
		selectOption.textContent = optionValue.text;
		selectOption.selectBox = selectBox;
		return selectOption;
	}

	static getDomClass() {
		return "select-option";
	}

}

export class SelectBox<T> extends HTMLElement {

	private _optionWrapper!: SelectOptionWrapper;
	private _internals: ElementInternals;
	private _valueNameMap: Map<T, string> = new Map();
	private _win!: Window;
	private _value!: T;

	constructor() {
		super();
		this._internals = this.attachInternals();
		this.onclick = (e) => {
			this._win.document.body.appendChild(this._optionWrapper);
			const rect = this.getBoundingClientRect();
			this._optionWrapper.style.top = rect.bottom + "px";
			this._optionWrapper.style.left = rect.left + "px";
			this._optionWrapper.style.width = rect.width + "px";
			this._optionWrapper._internals.states.add("open-down");
			this._internals.states.add("open-down");
			this._optionWrapper.updateSelectedState(this._valueNameMap.get(this._value) as string);
			this._win.addEventListener("mousedown", this.hidingClosure);
		};
	}

	hidingClosure = () => {
		this._win.document.body.removeChild(this._optionWrapper);
		this._internals.states.delete("open-down");
		this._optionWrapper._internals.states.delete("open-down");
		this._win.removeEventListener("mousedown", this.hidingClosure);
	};

	onValueChange = (value: SelectOptionValue<T>) => { value; };

	setOption(optionValue: SelectOptionValue<T>) {
		this.textContent = optionValue.text;
		this.hidingClosure();
		this.onValueChange(optionValue);
	}

	addOption(win: Window, optionValue: SelectOptionValue<T>) {
		const selectOption = SelectOption.createSelectOption(win, optionValue, this);
		this._optionWrapper.appendChild(selectOption);
		this._valueNameMap.set(optionValue.value, optionValue.text);
	}

	public static createUIElement<T>(win: Window): SelectBox<T> {
		const selectBox = win.document.createElement(this.getDomClass()) as SelectBox<T>;
		selectBox._win = win;
		selectBox._optionWrapper = SelectOptionWrapper.createSelectOptionWrapper(win);
		return selectBox;
	}

	static getDomClass() {
		return "select-box";
	}
}
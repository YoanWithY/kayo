import { PageContext } from "../../PageContext";
import UIVariableComponent from "./UIComponent";

type SelectValueType = number | string;
type SelectOptionValue = { value: SelectValueType, text: string };
export class SelectBox extends UIVariableComponent<SelectValueType> {
	private _optionWrapper!: SelectOptionWrapper;
	private _value!: SelectValueType;
	private _internals: ElementInternals;
	private _valueNameMap: any = {};
	private _win!: Window;

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
			this._optionWrapper.updateSelectedState(this._value);
			this._win.addEventListener("mousedown", this.hidingClosure);
		};
	}

	hidingClosure = () => {
		this._win.document.body.removeChild(this._optionWrapper);
		this._internals.states.delete("open-down");
		this._optionWrapper._internals.states.delete("open-down");
		this._win.removeEventListener("mousedown", this.hidingClosure);
	};

	addOption(win: Window, optionValue: SelectOptionValue) {
		const selectOption = SelectOption.createSelectOption(win, optionValue, this);
		this._optionWrapper.appendChild(selectOption);
		this._valueNameMap[optionValue.value] = optionValue.text;
	}

	setValue(value: number | string): void {
		this._value = value;
		this.textContent = this._valueNameMap[this._value];
	}

	public static createUIElement(win: Window, pageContext: PageContext, obj: any): SelectBox {
		const selectBox = win.document.createElement(this.getDomClass()) as SelectBox;
		selectBox._win = win;
		selectBox._optionWrapper = SelectOptionWrapper.createSelectOptionWrapper(win);
		const options = obj.options;
		for (const option of options)
			selectBox.addOption(win, option as SelectOptionValue);
		const stateVariable = pageContext.project.getVariableFromURL(obj.stateVariableURL);
		if (stateVariable)
			selectBox.bind(stateVariable);
		return selectBox;
	}

	public static getDomClass() {
		return "select-box";
	}
}

export class SelectOptionWrapper extends HTMLElement {
	_internals: ElementInternals = this.attachInternals();

	static createSelectOptionWrapper(win: Window): SelectOptionWrapper {
		return win.document.createElement("select-option-wrapper") as SelectOptionWrapper;
	}

	updateSelectedState(active: SelectValueType) {
		for (const selectionOption of this.children) {
			if (selectionOption instanceof SelectOption) {
				if (selectionOption.optionValue.value === active) {
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
	selectBox!: SelectBox;
	_internals = this.attachInternals();
	constructor() {
		super();
		this.onclick = () => {
			this.selectBox.stateVariable.value = this.optionValue.value;
			this.selectBox.hidingClosure();
		};
		this.onmousedown = (e) => {
			e.stopImmediatePropagation();
		}
	}
	static createSelectOption(win: Window, optionValue: SelectOptionValue, selectBox: SelectBox): SelectOption {
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
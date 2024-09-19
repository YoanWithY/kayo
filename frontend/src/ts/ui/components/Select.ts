import StateVariable from "../../project/StateVariable";

export class SelectBox<T> extends HTMLElement {

	optionWrapper!: SelectOptionWrapper<T>;
	variable?: StateVariable<T>;
	valueText: Map<T, string> = new Map();
	private _internals: ElementInternals;
	hidingClosure = () => {
		document.body.removeChild(this.optionWrapper);
		this._internals.states.delete("open-down");
		this.optionWrapper._internals.states.delete("open-down");
		document.removeEventListener("mousedown", this.hidingClosure);
	};

	constructor() {
		super();
		this._internals = this.attachInternals();
		this.onclick = () => {
			document.body.appendChild(this.optionWrapper);
			const rect = this.getBoundingClientRect();
			this.optionWrapper.style.top = rect.bottom + "px";
			this.optionWrapper.style.left = rect.left + "px";
			this.optionWrapper.style.width = rect.width + "px";
			this.optionWrapper._internals.states.add("open-down");
			this._internals.states.add("open-down");
			if (this.variable)
				this.optionWrapper.updateSelectedState(this.variable.value);
			document.addEventListener("mousedown", this.hidingClosure);
		};
	}

	static createSelectBox<T>(): SelectBox<T> {
		const selectBox = document.createElement("select-box") as SelectBox<T>;
		selectBox.optionWrapper = SelectOptionWrapper.createSelectOptionWrapper<T>();
		return selectBox;
	}

	addOption(value: T, text: string) {
		const selectOption = SelectOption.createSelectOption<T>(value, text, this);
		this.valueText.set(value, text);
		this.optionWrapper.appendChild(selectOption);
	}

	uiCallback = (value: T) => {
		const text = this.valueText.get(value);
		this.textContent = text === undefined ? "" : text;
	}

	bind(variable: StateVariable<T>) {
		if (this.variable) {
			this.disconnectedCallback();
		}
		this.variable = variable;
		this.uiCallback(this.variable.value);
	}

	connectedCallback() {
		if (this.variable) {
			this.variable?.addChangeListener(this.uiCallback, "immediate");
			this.uiCallback(this.variable.value);
		}
	}

	disconnectedCallback() {
		this.variable?.removeChangeListener(this.uiCallback, "immediate");
	}
}

export class SelectOptionWrapper<T> extends HTMLElement {
	_internals: ElementInternals = this.attachInternals();

	static createSelectOptionWrapper<T>(): SelectOptionWrapper<T> {
		return document.createElement("select-option-wrapper") as SelectOptionWrapper<T>;
	}

	updateSelectedState(active: T) {
		for (const selOpt of this.children) {
			if (selOpt instanceof SelectOption) {
				if (selOpt.value === active) {
					selOpt._internals.states.add("selected");
				} else {
					selOpt._internals.states.delete("selected");
				}
			}
		}
	}
}

export class SelectOption<T> extends HTMLElement {
	value!: T;
	selectBox!: SelectBox<T>
	_internals = this.attachInternals();
	constructor() {
		super();
		this.onclick = () => {
			const variable = this.selectBox.variable;
			if (variable)
				variable.value = this.value;

			this.selectBox.hidingClosure();
		};
		this.onmousedown = (e) => {
			e.stopImmediatePropagation();
		}
	}
	static createSelectOption<T>(value: T, text: string, selectBox: SelectBox<T>): SelectOption<T> {
		const selectOption = document.createElement("select-option") as SelectOption<T>;
		selectOption.value = value;
		selectOption.textContent = text;
		selectOption.selectBox = selectBox;
		return selectOption;
	}

	getValue(): T {
		return this.value;
	}
}
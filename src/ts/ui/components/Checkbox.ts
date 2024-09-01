import StateVariable from "../../project/StateVariable"
import { createPre } from "../UIUtils";
import Tooltip, { Tooltipabble } from "./Tooltip";

export default class Checkbox extends HTMLElement implements Tooltipabble<string> {
	private _internals: ElementInternals;
	variable?: StateVariable<boolean>;
	constructor() {
		super();
		this._internals = this.attachInternals();
		this.onclick = () => {
			if (this.variable)
				this.variable.value = !this.variable.value;
		};
	}

	setTooltip(tooltip: string): void {
		Tooltip.register(Tooltip.createTooltip(createPre(tooltip)), this);
	}

	uiCallback = (value: boolean) => {
		if (value)
			this._internals.states.add("checked");
		else
			this._internals.states.delete("checked");
	};

	/**
	 * Bind this checkbox to a StateVariable. If this way already bound to a variable, this bond is destroyed.
	 * @param variable 
	 */
	public bind(variable: StateVariable<boolean>) {
		if (this.variable) {
			this.disconnectedCallback();
		}
		this.variable = variable;
		this.uiCallback(this.variable.value);
	}

	connectedCallback() {
		if (this.variable) {
			this.variable.addChangeListener(this.uiCallback, "immediate");
			this.uiCallback(this.variable.value);
		}
	}

	disconnectedCallback() {
		this.variable?.removeChangeListener(this.uiCallback, "immediate");
	}

	static createCheckbox() {
		return document.createElement("check-box") as Checkbox;
	}
}
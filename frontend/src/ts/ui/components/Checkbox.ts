import { Tooltipabble } from "./Tooltip";
import UIVariableComponent from "./UIComponent";

export default class Checkbox extends UIVariableComponent implements Tooltipabble<string> {
	private _internals: ElementInternals;

	constructor() {
		super();
		this._internals = this.attachInternals();
	}

	setTooltip(_: string): void {
		// Tooltip.register(Tooltip.createTooltip(tooltip), this);
	}

	setUiValue(value: string) {
		if (value == "true") this._internals.states.add("checked");
		else this._internals.states.delete("checked");
	}
}

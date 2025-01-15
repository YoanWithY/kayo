import { PageContext } from "../../PageContext";
import { Tooltipabble } from "./Tooltip";
import UIVariableComponent from "./UIComponent";

export default class Checkbox extends UIVariableComponent<boolean> implements Tooltipabble<string> {
	private _internals: ElementInternals;

	constructor() {
		super();
		this._internals = this.attachInternals();



	}

	setTooltip(_: string): void {
		// Tooltip.register(Tooltip.createTooltip(tooltip), this);
	}

	setValue(value: boolean) {
		if (value)
			this._internals.states.add("checked");
		else
			this._internals.states.delete("checked");
	};

	static createCheckbox(_: Document, pageContext: PageContext, _1: any) {
		// const checkbox = doc.createElement("check-box") as Checkbox;
		return pageContext;
	}
}
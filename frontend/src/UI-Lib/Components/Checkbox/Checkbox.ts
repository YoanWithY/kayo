import { IOAPI } from "../../../IO-Interface/IOAPI";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { UIElementBuilder } from "../../UIElementBuilder";
import { resolvePathVariables } from "../../UIUtils";
import css from "./checkbox.css?inline";

export class Checkbox extends HTMLElement {
	public ioapi!: IOAPI;
	public stateURL!: string;
	// private _internals: ElementInternals;

	public constructor() {
		super();
		// this._internals = this.attachInternals();
	}

	// private _stateChangeCallback = (value: boolean) => {
	// 	if (value)
	// 		this._internals.states.add("checked");
	// 	else
	// 		this._internals.states.delete("checked");
	// };

	protected connectedCallback() {
		// todo
	}

	protected disconnectedCallback() {
		// todo
	}
}

export class CheckboxBuilder<T extends IOAPI> extends UIElementBuilder<T, Checkbox> {
	protected _domClassName = "check-box";
	protected get _domClass() {
		return Checkbox;
	}

	public _initWindowComponentStyles(win: Window) {
		this.addStyle(css, win);
	}

	public build(win: Window, builder: WindowUIBuilder<T>, config: any) {
		const checkbox = win.document.createElement(this._domClassName) as Checkbox;
		checkbox.ioapi = builder.IOAPI;
		checkbox.stateURL = resolvePathVariables(config.stateVariableURL, config.varMap);
		return checkbox;
	}
}

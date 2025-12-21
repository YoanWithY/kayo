import { Kayo } from "../../Kayo";
import { IconedToggleButton } from "./IconedToggleButton";
import Tooltip, { SerialTooltip } from "./Tooltip";
import emptyIcon from "../../../svg/empty.svg?raw";
import checkIcon from "../../../svg/check.svg?raw";
import { Project } from "../../project/Project";

export default class Checkbox extends IconedToggleButton {
	private _project!: Project;
	private _stateURL!: string;
	private _internals: ElementInternals;

	public constructor() {
		super();
		this._internals = this.attachInternals();
	}

	private _stateChangeCallback = (value: boolean) => {
		if (value) {
			this._internals.states.add("checked");
			this.setStateUIOnly(1);
		} else {
			this._internals.states.delete("checked");
			this.setStateUIOnly(0);
		}
	};

	protected connectedCallback() {
		super.connectedCallback();
		this._project.addChangeListener(this._stateURL, this._stateChangeCallback, true);
	}

	protected disconnectedCallback() {
		super.disconnectedCallback();
		this._project.removeChangeListener(this._stateURL, this._stateChangeCallback);
	}

	public static createUIElement(win: Window, kayo: Kayo, obj: any, varMap?: { [key: string]: string }): Checkbox {
		const p = win.document.createElement(this.getDomClass()) as Checkbox;
		if (obj.tooltip) Tooltip.register(win, obj.tooltip as SerialTooltip, p, obj);
		p._project = kayo.project;

		p._stateURL = Project.resolvePathVariables(obj.stateVariableURL, varMap);
		p._state = 0;
		p._states = [
			{
				svgIcon: emptyIcon,
				callback: () => p._project.setValueByURL(p._stateURL, false),
			},
			{
				svgIcon: checkIcon,
				callback: () => p._project.setValueByURL(p._stateURL, true),
			},
		];
		return p;
	}

	public static getDomClass(): string {
		return "check-box";
	}
}

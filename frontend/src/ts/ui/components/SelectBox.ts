import { Kayo } from "../../Kayo";
import { Project } from "../../project/Project";
import { MarkUneffectiveEntry } from "../ui";
import { DropDownItem, DropDown } from "./DropDown";
import Tooltip, { SerialTooltip } from "./Tooltip";

export type SelectOptionValue = { value: any; text: string };

export class SelectBox extends HTMLElement {
	private _win!: Window;
	private _project!: Project;
	private _stateURL!: string;
	private _uneffectiveIfAny?: MarkUneffectiveEntry[];
	private callbacks: { path: string; callback: (v: any) => void }[] = [];
	private _dropDown!: DropDown;
	private _internals: ElementInternals;
	private _valueNameMap: Map<string, string> = new Map();
	private _varMap?: { [key: string]: string } | undefined;

	public constructor() {
		super();
		this._internals = this.attachInternals();
		this.onclick = () => {
			this._win.document.body.appendChild(this._dropDown);
			const rect = this.getBoundingClientRect();
			this._dropDown.open(rect.x, rect.bottom)
			this._internals.states.add("open-down");
			this._win.addEventListener("mousedown", this._hidingClosure);
		};
	}

	private _hidingClosure = () => {
		this._internals.states.delete("open-down");
	};

	public onSetOption = (_: SelectOptionValue) => { }

	private addOption(win: Window, optionValue: SelectOptionValue, onActivate: () => void) {
		const selectOption = DropDownItem.createDropDownItem(win, this._dropDown, optionValue.text, onActivate);
		this._dropDown.addDropDownItem(selectOption);
		this._valueNameMap.set(optionValue.value.toString(), optionValue.text);
	}

	protected connectedCallback() {
		for (const call of this.callbacks) this._project.addChangeListener(call.path, call.callback, true);
	}

	protected disconnectedCallback() {
		for (const call of this.callbacks) this._project.removeChangeListener(call.path, call.callback);
	}

	private _stateChangeCallback = (wasmValue: any) => {
		this.textContent = this._valueNameMap.get(wasmValue.toString()) as string;
	};

	private _checkMarkUneffective() {
		if (!this._uneffectiveIfAny)
			return false;
		for (const entry of this._uneffectiveIfAny) {
			const path = Project.resolvePathVariables(entry.stateVariableURL, this._varMap);
			const val = this._project.getValueByPath(path);
			for (const compValue of entry.anyOf) if (val == compValue) return true;
		}
		return false;
	}

	public setMarkUneffective(markUneffective: boolean) {
		if (markUneffective) this._internals.states.add("uneffective");
		else this._internals.states.delete("uneffective");
	}

	private _checkDisablingCallback = () => {
		this.setMarkUneffective(this._checkMarkUneffective());
	};

	public static createUIElement(
		win: Window,
		kayo: Kayo,
		obj: { options: SelectOptionValue[], stateVariableURL?: string, uneffectiveIfAny?: MarkUneffectiveEntry[], tooltip?: any },
		varMap?: { [key: string]: string },
	): SelectBox {
		const selectBox = win.document.createElement(this.getDomClass()) as SelectBox;
		selectBox._win = win;
		selectBox._varMap = varMap;
		selectBox._dropDown = DropDown.createSelectOptionWrapper(win);
		selectBox._project = kayo.project;

		if (obj.stateVariableURL) {
			selectBox._stateURL = Project.resolvePathVariables(obj.stateVariableURL, varMap);
			selectBox.callbacks.push({ path: selectBox._stateURL, callback: selectBox._stateChangeCallback });
			selectBox.onSetOption = (selectOptionValue: SelectOptionValue) => {
				selectBox._project.setValueByURL(selectBox._stateURL, selectOptionValue.value);
			};
		}

		selectBox._uneffectiveIfAny = obj.uneffectiveIfAny;
		if (selectBox._uneffectiveIfAny !== undefined) {
			for (const entry of selectBox._uneffectiveIfAny) {
				selectBox.callbacks.push({
					path: Project.resolvePathVariables(entry.stateVariableURL, varMap),
					callback: selectBox._checkDisablingCallback,
				});
			}
		}

		const options = obj.options;
		for (const selectOptionValue of options as SelectOptionValue[]) {
			const onActivate = () => {
				selectBox.onSetOption(selectOptionValue)
			};
			selectBox.addOption(win, selectOptionValue, onActivate);
		}

		if (obj.tooltip) Tooltip.register(win, obj.tooltip as SerialTooltip, selectBox, obj);

		return selectBox;
	}

	public static getDomClass() {
		return "state-select-box";
	}
}

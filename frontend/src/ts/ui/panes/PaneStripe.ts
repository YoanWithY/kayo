import { Kayo } from "../../Kayo";
import { SelectBox, SelectOptionValue } from "../components/SelectBox";
import { SplitablePane } from "../splitpane/SplitablePane";
import { panesNameClassMap } from "./PaneSelectorPane";

export class PaneStripe extends HTMLElement {
	public static size = parseFloat(
		getComputedStyle(document.documentElement).getPropertyValue("--pane-stripe-hight").replace("px", ""),
	);
	public static size2 = this.size * 2;

	private _kayo!: Kayo;

	private _dblclickCallback = () => {
		(this.parentElement as SplitablePane).toggleSingleWindow();
	};

	private _contextMenueCallback = (e: MouseEvent) => {
		e.preventDefault();
		this._kayo.openNewWindow();
	};

	protected connectedCallback() {
		this.addEventListener("dblclick", this._dblclickCallback);
		this.addEventListener("contextmenu", this._contextMenueCallback);
	}

	public static createPaneStripe(win: Window, kayo: Kayo, name: string) {
		const p = win.document.createElement("pane-stripe") as PaneStripe;
		p._kayo = kayo;

		const options: SelectOptionValue[] = [];
		for (const name in panesNameClassMap) {
			options.push({ text: name, value: name });
		}
		const selectBox = SelectBox.createUIElement(win, kayo, { options });
		selectBox.textContent = name;

		selectBox.onSetOption = (optionValue: SelectOptionValue) => {
			const parent = p.parentElement;
			if (!parent) return;
			(parent as SplitablePane).recreateContent(win, kayo, panesNameClassMap[optionValue.value.toString()]);
		};
		p.appendChild(selectBox);
		return p;
	}

	public static getDomClass() {
		return "pane-stripe";
	}
}

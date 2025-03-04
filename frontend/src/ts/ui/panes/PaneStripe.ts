import { PageContext } from "../../PageContext";
import { SelectBox, SelectOptionValue } from "../components/StateSelectBox";
import { SplitablePane } from "../splitpane/SplitablePane";
import { UIPaneElement } from "../ui";
import { panesNameClassMap } from "./PaneSelectorPane";

export class PaneStripe extends HTMLElement {
	static size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pane-stripe-hight").replace("px", ""));
	static size2 = this.size * 2;

	static createPaneStripe(win: Window, pageContext: PageContext, name: string) {
		const p = win.document.createElement("pane-stripe");
		p.addEventListener("dblclick", (_) => {
			(p.parentElement as SplitablePane).toggleSingleWindow();
		});

		const selectBox = SelectBox.createUIElement<UIPaneElement>(win);

		const options: SelectOptionValue<UIPaneElement>[] = [];
		for (const name in panesNameClassMap) {
			options.push({ text: name, value: panesNameClassMap[name] });
		}
		for (const option of options)
			selectBox.addOption(win, option);
		selectBox.textContent = name;

		selectBox.onValueChange = (optionValue: SelectOptionValue<UIPaneElement>) => {
			const parent = p.parentElement;
			if (!parent)
				return;
			(parent as SplitablePane).recreateContetent(win, pageContext, optionValue.value);
		};
		p.appendChild(selectBox);
		return p
	}

	public static getDomClass() {
		return "pane-stripe";
	}
}
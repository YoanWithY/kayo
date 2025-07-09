import { PTPChatPane } from "../../collaborative/PTPChatPannel";
import { Kayo } from "../../Kayo";
import { SplitablePane } from "../splitpane/SplitablePane";
import { UIPaneElement } from "../ui";
import BasicPane from "./BasicPane";
import OutlinerPane from "./OutlinerPane";
import OutputPane from "./OutpuPane";
import APIPane from "./ApiPane";
import { ViewportPane } from "./ViewportPane";

export default class PaneSelectorPane extends BasicPane {
	public static createUIElement(win: Window, kayo: Kayo, _: any): PaneSelectorPane {
		const p = super.createUIElement(win, kayo, { class: this.getDomClass() });
		for (const key in panesNameClassMap) {
			const button = win.document.createElement("button");
			button.className = "selectorButton";
			button.textContent = key;
			button.onclick = () => {
				const parent = p.parentElement;
				if (!parent) return;
				(parent as SplitablePane).recreateContent(win, kayo, panesNameClassMap[key]);
			};
			p.appendChild(button);
		}
		return p;
	}

	public static getDomClass() {
		return "pane-selector-pane";
	}

	public static getName() {
		return "Pane Select";
	}
}

export const panesNameClassMap: { [key: string]: UIPaneElement } = {
	[ViewportPane.getName()]: ViewportPane,
	[APIPane.getName()]: APIPane,
	[OutputPane.getName()]: OutputPane,
	[OutlinerPane.getName()]: OutlinerPane,
	[PTPChatPane.getName()]: PTPChatPane,
	[PaneSelectorPane.getName()]: PaneSelectorPane,
};

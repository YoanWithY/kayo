import { PTPChatPane } from "../../collaborative/PTPChatPannel";
import { Kayo } from "../../Kayo";
import { SplitablePane } from "../splitpane/SplitablePane";
import { UIPaneElement } from "../ui";
import OutlinerPane from "./OutlinerPane";
import OutputPane from "./OutpuPane";
import { ViewportPane } from "./ViewportPane";
import { AnimationPane } from "./animation/AnimationPane";
import { DebugPane } from "./debug/DebugPane";

export default class PaneSelectorPane extends HTMLElement {
	public static createUIElement(win: Window, kayo: Kayo): PaneSelectorPane {
		const p = win.document.createElement(this.getDomClass());
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
	[PaneSelectorPane.getName()]: PaneSelectorPane,
	[AnimationPane.getName()]: AnimationPane,
	[ViewportPane.getName()]: ViewportPane,
	[OutputPane.getName()]: OutputPane,
	[OutlinerPane.getName()]: OutlinerPane,
	[PTPChatPane.getName()]: PTPChatPane,
	[DebugPane.getName()]: DebugPane,
};

import { PTPChatPane } from "../../collaborative/PTPChatPannel";
import { Kayo } from "../../Kayo";
import { SplitablePane } from "../splitpane/SplitablePane";
import { UIPaneElement } from "../ui";
import OutlinerPane from "./OutlinerPane";
import OutputPane from "./OutpuPane";
import APIPane from "./ApiPane";
import { ViewportPane } from "./ViewportPane";
import { FileSystemPane } from "./FileSystemPane";
import { PerformancePane } from "./performance/PerformancePane";
import { AnimationPane } from "./animation/AnimationPane";

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
	[ViewportPane.getName()]: ViewportPane,
	[APIPane.getName()]: APIPane,
	[OutputPane.getName()]: OutputPane,
	[OutlinerPane.getName()]: OutlinerPane,
	[PTPChatPane.getName()]: PTPChatPane,
	[PaneSelectorPane.getName()]: PaneSelectorPane,
	[FileSystemPane.getName()]: FileSystemPane,
	[PerformancePane.getName()]: PerformancePane,
	[AnimationPane.getName()]: AnimationPane,
};

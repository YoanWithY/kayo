import { Kayo } from "../../../Kayo";
import { Tab, TabbedPanel } from "../../components/TabbedPanel";
import APIPanel from "./ApiPanel";
import { FileSystemPanel } from "./FileSystemPanel";
import { PerformancePanel } from "./performance/PerformancePanel";
import { SVTDebugPanel } from "./svtDebug/SVTDebugPanel";

export class DebugPane extends HTMLElement {
	public static createUIElement(win: Window, kayo: Kayo): DebugPane {
		const p = win.document.createElement(this.getDomClass()) as DebugPane;
		const tabbedPanel = TabbedPanel.createUIElement(win, kayo);

		for (const Panel of [APIPanel, PerformancePanel, FileSystemPanel, SVTDebugPanel]) {
			const tab = new Tab(win);
			tab.getContent().appendChild(Panel.createUIElement(win, kayo));
			const tabLable = win.document.createElement("span");
			tabLable.textContent = Panel.getName();
			tab.getTab().appendChild(tabLable);
			tabbedPanel.addTab(tab);
			if (Panel == APIPanel) tabbedPanel.setActiveTab(tab);
		}
		p.appendChild(tabbedPanel);
		return p;
	}

	public static getDomClass(): string {
		return "debug-pane";
	}

	public static getName() {
		return "Debug";
	}
}

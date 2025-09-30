import { Kayo } from "../../Kayo";
import { Tab, TabbedPanel } from "../components/TabbedPanel";
import { buildUIElement } from "../ui";
import realtime from "./realtimeConfig.json";

export default class OutputPane extends HTMLElement {
	private _win!: Window;
	private _kayo!: Kayo;
	private _tabbed!: TabbedPanel;
	public static createUIElement(win: Window, kayo: Kayo, _?: any): OutputPane {
		const p = win.document.createElement(this.getDomClass()) as OutputPane;
		p._win = win;
		p._kayo = kayo;
		p._tabbed = TabbedPanel.createUIElement(win, kayo);
		p.appendChild(p._tabbed);
		p.addRealtimeConfig("realtime default");
		return p;
	}

	public addRealtimeConfig(key: string) {
		const tab = new Tab(this._win);
		const tabName = this._win.document.createElement("span");
		tabName.textContent = key;
		tab.getTab().appendChild(tabName);
		tab.getContent().appendChild(buildUIElement(this._win, this._kayo, realtime, { $config: key }));

		this._tabbed.addTab(tab);
		this._tabbed.setActiveTab(tab);
	}

	public static getDomClass() {
		return "output-pane";
	}

	public static getName() {
		return "Output";
	}
}

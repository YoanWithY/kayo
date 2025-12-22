import { Kayo } from "../../Kayo";

export class Tab {
	private _content!: HTMLElement;
	private _tabIcon!: HTMLElement;
	private _tabbedPane?: TabbedPanel;
	public constructor(win: Window) {
		this._content = win.document.createElement("div");
		this._content.classList.add("tabbed-panel-content");
		this._tabIcon = win.document.createElement("div");
		this._tabIcon.classList.add("tabbed-panel-tab");
		const clickCallback = () => {
			if (!this._tabbedPane) return;
			this._tabbedPane.setActiveTab(this);
		};
		this._tabIcon.addEventListener("click", clickCallback);
	}
	public getContent(): HTMLElement {
		return this._content;
	}
	public getTab(): HTMLElement {
		return this._tabIcon;
	}
	/**
	 * Only to be used by the TabbedPane itself.
	 */
	public setTabbedPane(pane?: TabbedPanel) {
		this._tabbedPane = pane;
	}
}

export class TabbedPanel extends HTMLElement {
	private _navigator!: HTMLDivElement;
	private _activeTab!: Tab;
	private _tabs: Tab[] = [];
	public static createUIElement(win: Window, __: Kayo): TabbedPanel {
		const p = win.document.createElement(this.getDomClass()) as TabbedPanel;
		p._navigator = win.document.createElement("div");
		p._navigator.classList.add("tabbed-panel-navigator");
		p.appendChild(p._navigator);
		return p;
	}

	public addTab(tab: Tab) {
		if (this._tabs.includes(tab)) return false;
		this._tabs.push(tab);
		this._navigator.appendChild(tab.getTab());
		tab.setTabbedPane(this);
		return true;
	}

	public removeTab(_: Tab) {}

	public setActiveTab(tab: Tab) {
		if (this._activeTab) {
			this._activeTab.getTab().classList.remove("active-tab");
			this.removeChild(this._activeTab.getContent());
		}
		this._activeTab = tab;
		this._activeTab.getTab().classList.add("active-tab");
		this.appendChild(this._activeTab.getContent());
	}

	public static getDomClass() {
		return "tabbed-panel";
	}
}

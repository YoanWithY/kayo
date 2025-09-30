import { Kayo } from "../../Kayo";

export class Tab {
	private _content!: HTMLElement;
	private _tabIcon!: HTMLElement;
	private _tabbedPane?: TabbedPanel;
	public constructor(win: Window) {
		this._content = win.document.createElement("div");
		this._tabIcon = win.document.createElement("div");

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
	private _activeTab!: HTMLElement;
	private _tabs: Tab[] = [];
	public static createUIElement(win: Window, __: Kayo): TabbedPanel {
		const p = win.document.createElement(this.getDomClass()) as TabbedPanel;
		p._navigator = win.document.createElement("div");
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
		if (this._activeTab == tab.getContent()) return;

		try {
			this.removeChild(this._activeTab);
		} catch (_) {}

		this._activeTab = tab.getContent();
		this.appendChild(this._activeTab);
	}

	public static getDomClass() {
		return "tabbed-pannel";
	}
}

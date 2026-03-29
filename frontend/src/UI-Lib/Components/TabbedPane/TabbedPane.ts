import { IOAPI } from "../../../IO-Interface/IOAPI";
import { UIElementBuilder } from "../../UIElementBuilder";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import css from "./TabbedPane.css?inline";

export class Tab<T extends IOAPI> {
    private _content!: HTMLElement;
    private _tabElement!: HTMLElement;
    private _tabbedPane?: TabbedPane<T>;

    public constructor(windowUIBuilder: WindowUIBuilder<T>) {
        this._content = windowUIBuilder.createElement("div");
        this._content.classList.add("tabbed-pane-content");
        this._tabElement = windowUIBuilder.createElement("div");
        this._tabElement.classList.add("tabbed-pane-tab");
        const clickCallback = () => {
            if (!this._tabbedPane) return;
            this._tabbedPane.setActiveTab(this);
        };
        this._tabElement.addEventListener("click", clickCallback);
    }

    public getTabContent(): HTMLElement {
        return this._content;
    }

    public getTabElement(): HTMLElement {
        return this._tabElement;
    }

    /**
     * Only to be used by the TabbedPane itself.
     */
    public setTabbedPane(pane?: TabbedPane<T>) {
        this._tabbedPane = pane;
    }
}

class TabbedPane<T extends IOAPI> extends HTMLElement {
    public navigator!: HTMLDivElement;
    private _activeTab!: Tab<T>;
    private _tabs: Tab<T>[] = [];

    public addTab(tab: Tab<T>) {
        if (this._tabs.includes(tab)) return false;
        this._tabs.push(tab);
        this.navigator.appendChild(tab.getTabElement());
        tab.setTabbedPane(this);
        return true;
    }

    public setActiveTab(tab: Tab<T>) {
        if (this._activeTab) {
            this._activeTab.getTabElement().classList.remove("active-tab");
            this.removeChild(this._activeTab.getTabContent());
        }
        this._activeTab = tab;
        this._activeTab.getTabElement().classList.add("active-tab");
        this.appendChild(this._activeTab.getTabContent());
    }
}

export class TabbedPaneBuilder<T extends IOAPI> extends UIElementBuilder<T, TabbedPane<T>> {
    protected _domClassName = "tabbed-pane";

    protected get _domClass(): CustomElementConstructor {
        return TabbedPane;
    }

    public build(windowUIBuilder: WindowUIBuilder<T>, config: any): TabbedPane<T> {
        const tabbedPane = windowUIBuilder.createElement<TabbedPane<T>>(this._domClassName);
        tabbedPane.navigator = windowUIBuilder.createElement("div");
        tabbedPane.appendChild(tabbedPane.navigator);
        tabbedPane.navigator.classList.add("tabbed-pane-navigator")

        for (const tabEntry of config.tabs) {
            const tab = new Tab(windowUIBuilder)
            tabbedPane.addTab(tab);

            const tabLabel = windowUIBuilder.createElement("span");
            tab.getTabElement().appendChild(tabLabel);
            tabLabel.textContent = tabEntry.displayName;

            const tabContent = windowUIBuilder.build(tabEntry.config);
            if (!tabContent) {
                console.error("Could not create", tabEntry.config);
                continue;
            }
            tab.getTabContent().appendChild(tabContent);
        }
        return tabbedPane;
    }

    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<T>): void {
        windowUIBuilder.addStyle(css);
    }

}
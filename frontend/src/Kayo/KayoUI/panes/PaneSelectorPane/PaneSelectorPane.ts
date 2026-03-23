import { SplitablePane } from "../../../../UI-Lib/SplitPane/SplitablePane/SplitablePane";
import { UIElementBuilder } from "../../../../UI-Lib/UIElementBuilder";
import { KayoAPI } from "../../../KayoAPI/KayoAPI";
import css from "./PaneSelctorPane.css?inline";

export class PaneSelectorPane extends HTMLElement {
}

export class PaneSelectorPaneBuilder extends UIElementBuilder<KayoAPI, PaneSelectorPane> {
	protected _domClassName = "pane-selector-pane";
	protected _panesClassNameMap: Map<string, string> = new Map();

	protected get _domClass(): CustomElementConstructor {
		return PaneSelectorPane;
	}

	public build(_: any): PaneSelectorPane {
		const paneSelctorPane = this.createElement<PaneSelectorPane>(this._domClassName);
		for (const [domClassName, displayName] of this._panesClassNameMap) {
			const button = this.createElement<PaneSelectorPane>("button");
			button.className = "selectorButton";
			button.textContent = displayName;
			button.onclick = () => {
				const parent = paneSelctorPane.parentElement;
				if (!parent) return;
				(parent as SplitablePane<KayoAPI>).setContent(this.windowUIBuilder, { domClassName: domClassName });
			};
			paneSelctorPane.appendChild(button);
		}
		return paneSelctorPane;
	}

	protected _initWindowComponentStyles(): void {
		this.addStyle(css);
	}

	public addPaneType(paneDomClassName: string, paneDisplayName: string) {
		this._panesClassNameMap.set(paneDomClassName, paneDisplayName);
	}
}

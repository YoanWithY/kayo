import { SplitablePane } from "../../../../UI-Lib/SplitPane/SplitablePane/SplitablePane";
import { UIElementBuilder } from "../../../../UI-Lib/UIElementBuilder";
import { WindowUIBuilder } from "../../../../UI-Lib/WindowUIBUilder";
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

	public build(windowUIBuilder: WindowUIBuilder<KayoAPI>, _: any): PaneSelectorPane {
		const paneSelctorPane = windowUIBuilder.createElement<PaneSelectorPane>(this._domClassName);
		for (const [domClassName, displayName] of this._panesClassNameMap) {
			const button = windowUIBuilder.createElement<PaneSelectorPane>("button");
			button.className = "selectorButton";
			button.textContent = displayName;
			button.onclick = () => {
				const parent = paneSelctorPane.parentElement;
				if (!parent) return;
				(parent as SplitablePane<KayoAPI>).setContent(windowUIBuilder, { domClassName: domClassName });
			};
			paneSelctorPane.appendChild(button);
		}
		return paneSelctorPane;
	}

	protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<KayoAPI>): void {
		windowUIBuilder.addStyle(css);
	}

	public addPaneType(paneDomClassName: string, paneDisplayName: string) {
		this._panesClassNameMap.set(paneDomClassName, paneDisplayName);
	}
}

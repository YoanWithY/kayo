import { SplitablePane } from "../../../../../UI-Lib/SplitPane/SplitablePane/SplitablePane";
import { UIElementBuilder } from "../../../../../UI-Lib/UIElementBuilder";
import { WindowUIBuilder } from "../../../../../UI-Lib/WindowUIBUilder";
import { KayoAPI } from "../../../../KayoAPI/KayoAPI";
import css from "./DebugPane.css?inline";
import structureConfig from "./DebugPane.json";

class DebugPane extends HTMLElement { }

export class DebugPaneBuilder extends UIElementBuilder<KayoAPI, DebugPane> {
	protected _domClassName = "debug-pane";

	protected get _domClass(): CustomElementConstructor {
		return DebugPane;
	}

	public build(windowUIBuilder: WindowUIBuilder<KayoAPI>, config: { splitablePane: SplitablePane<KayoAPI> }): DebugPane {
		const debugPane = windowUIBuilder.createElement(this._domClassName) as DebugPane;

		for (const childConfig of structureConfig.children) {
			(childConfig as any).splitablePane = config.splitablePane;
			const child = windowUIBuilder.build(childConfig);
			if (!child) {
				console.error("Could not create", childConfig);
				continue;
			}
			debugPane.appendChild(child);
		}

		return debugPane;
	}

	protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<KayoAPI>): void {
		windowUIBuilder.addStyle(css);
	}

}

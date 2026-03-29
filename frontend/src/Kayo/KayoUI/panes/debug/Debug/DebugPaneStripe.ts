import { SplitablePane } from "../../../../../UI-Lib/SplitPane/SplitablePane/SplitablePane";
import { UIElementBuilder } from "../../../../../UI-Lib/UIElementBuilder";
import { WindowUIBuilder } from "../../../../../UI-Lib/WindowUIBUilder";
import { KayoAPI } from "../../../../KayoAPI/KayoAPI";
import { createPaneSelectBox } from "../../PaneUtils";
import css from "./DebugPaneStripe.css?inline";

class DebugPaneStripe extends HTMLElement { }

export class DebugPaneStripeBuilder extends UIElementBuilder<KayoAPI, DebugPaneStripe> {
    protected _domClassName = "debug-pane-stripe";

    protected get _domClass() {
        return DebugPaneStripe;
    }

    public build(windowUIBuilder: WindowUIBuilder<KayoAPI>, config: { splitablePane: SplitablePane<KayoAPI> }): DebugPaneStripe {
        const debugPaneStripe = windowUIBuilder.createElement<DebugPaneStripe>(this._domClassName);
        const paneSelectBox = createPaneSelectBox(windowUIBuilder, config.splitablePane, "Debug");
        if (!paneSelectBox) {
            console.error("Coudl not create pane SelectBox!");
            return debugPaneStripe;
        }

        debugPaneStripe.appendChild(paneSelectBox);
        return debugPaneStripe;
    }
    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<KayoAPI>): void {
        windowUIBuilder.addStyle(css);
    }

}
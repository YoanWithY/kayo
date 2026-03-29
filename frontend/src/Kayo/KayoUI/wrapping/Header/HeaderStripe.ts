import { UIElementBuilder } from "../../../../UI-Lib/UIElementBuilder";
import { WindowUIBuilder } from "../../../../UI-Lib/WindowUIBUilder";
import { KayoAPI } from "../../../KayoAPI/KayoAPI";
import css from "./HeaderStripe.css?inline"
import headerConfig from "./Header.json";

class HeaderStripe extends HTMLElement { }

export class HeaderStripeBuilder extends UIElementBuilder<KayoAPI, HeaderStripe> {
    protected _domClassName = "header-stripe";

    protected get _domClass(): CustomElementConstructor {
        return HeaderStripe;
    }

    public build(windowUIBuilder: WindowUIBuilder<KayoAPI>, _: any): HeaderStripe {
        const header = windowUIBuilder.createElement<HeaderStripe>(this._domClassName);
        for (const conf of headerConfig.children) {
            const element = windowUIBuilder.build(conf);
            if (!element) {
                console.error("Could not build", conf);
                continue;
            }
            header.appendChild(element);
        }
        return header;
    }

    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<KayoAPI>): void {
        windowUIBuilder.addStyle(css);
    }

}
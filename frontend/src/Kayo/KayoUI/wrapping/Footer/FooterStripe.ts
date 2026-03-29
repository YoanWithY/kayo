import { UIElementBuilder } from "../../../../UI-Lib/UIElementBuilder";
import { WindowUIBuilder } from "../../../../UI-Lib/WindowUIBUilder";
import { KayoAPI } from "../../../KayoAPI/KayoAPI";
import css from "./FooterStripe.css?inline"

class FooterStripe extends HTMLElement { }

export class FooterStripeBuilder extends UIElementBuilder<KayoAPI, FooterStripe> {
    protected _domClassName = "footer-stripe";

    protected get _domClass(): CustomElementConstructor {
        return FooterStripe;
    }

    public build(windowUIBuilder: WindowUIBuilder<KayoAPI>, _: any): FooterStripe {
        const footer = windowUIBuilder.createElement<FooterStripe>(this._domClassName);

        const img = windowUIBuilder.createElement<HTMLImageElement>("img");
        footer.appendChild(img);
        img.src = "/favicon.svg";
        img.width = 24;

        const span = windowUIBuilder.createElement<HTMLSpanElement>("span");
        footer.appendChild(span);
        span.textContent = `${import.meta.env.PACKAGE_VERSION}`;

        return footer;
    }

    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<KayoAPI>): void {
        windowUIBuilder.addStyle(css);
    }

}
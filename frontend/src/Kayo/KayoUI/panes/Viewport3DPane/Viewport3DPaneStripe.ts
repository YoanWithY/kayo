import { UIElementBuilder } from "../../../../UI-Lib/UIElementBuilder";
import { PointerButtons } from "../../../../UI-Lib/UIUtils";
import { WindowUIBuilder } from "../../../../UI-Lib/WindowUIBUilder";
import { KayoAPI } from "../../../KayoAPI/KayoAPI";
import css from "./Viewport3DPaneStripe.css?inline";

export class Viewport3DPaneStripe extends HTMLElement {
    public kayoAPI!: KayoAPI;
    public PointerButtons!: typeof PointerButtons;

    private _onClick = (e: PointerEvent) => {
        e.preventDefault();
        if (e.button == this.PointerButtons.SECONDARY) {
            this.kayoAPI.ui.openNewWindow();
        }
    };

    protected connectedCallback() {
        this.addEventListener("pointerdown", this._onClick);
    }

    protected disconnectedCallback() {
        this.removeEventListener("pointerdown", this._onClick);
    }
}

export class Viewport3DPaneStripeBuilder extends UIElementBuilder<KayoAPI, Viewport3DPaneStripe> {
    protected _domClassName = "viewport-3d-pane-stripe";

    protected get _domClass() {
        return Viewport3DPaneStripe;
    }

    public build(windowUIBuilder: WindowUIBuilder<KayoAPI>, _: any): Viewport3DPaneStripe {
        const stripe = windowUIBuilder.createElement<Viewport3DPaneStripe>(this._domClassName);
        stripe.PointerButtons = PointerButtons;
        stripe.kayoAPI = windowUIBuilder.IOAPI;

        const span = windowUIBuilder.createElement<HTMLSpanElement>("span");
        stripe.appendChild(span);
        span.textContent = "Viewport 3D";

        return stripe;
    }

    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<KayoAPI>): void {
        windowUIBuilder.addStyle(css);
    }
}

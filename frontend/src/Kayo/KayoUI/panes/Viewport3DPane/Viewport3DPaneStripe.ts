import { UIElementBuilder } from "../../../../UI-Lib/UIElementBuilder";
import { PointerButtons } from "../../../../UI-Lib/UIUtils";
import { KayoAPI } from "../../../KayoAPI/KayoAPI";
import css from "./Viewport3DPaneStripe.css?inline";

export class Viewport3DPaneStripe extends HTMLElement {
    public kayoAPI!: KayoAPI;


    private _onClick = (e: PointerEvent) => {
        e.preventDefault();
        if (e.button == PointerButtons.SECONDARY) {
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

    public build(_: any): Viewport3DPaneStripe {
        const stripe = this.createElement<Viewport3DPaneStripe>(this._domClassName);
        stripe.kayoAPI = this.windowUIBuilder.IOAPI;

        const span = this.createElement<HTMLSpanElement>("span");
        stripe.appendChild(span);
        span.textContent = "Viewport 3D";

        return stripe;
    }

    protected _initWindowComponentStyles(): void {
        this.addStyle(css);
    }
}

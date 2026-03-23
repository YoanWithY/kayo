import { UIElementBuilder } from "../../../../UI-Lib/UIElementBuilder";
import { KayoAPI } from "../../../KayoAPI/KayoAPI";
import { Viewport3DPaneContent } from "./Viewport3DPaneContent";
import css from "./Viewport3DPane.css?inline";
import { Viewport3DPaneStripe } from "./Viewport3DPaneStripe";

export class Viewport3DPane extends HTMLElement {
	public stripe!: Viewport3DPaneStripe;
	public content!: Viewport3DPaneContent;
}

export class Viewport3DPaneBuilder extends UIElementBuilder<KayoAPI, Viewport3DPane> {
	protected _domClassName = "viewport-3d-pane";

	protected get _domClass() {
		return Viewport3DPane;
	}

	public build(_: any): Viewport3DPane {
		const viewport3DPane = this.createElement<Viewport3DPane>(this._domClassName);

		const stripe = this.windowUIBuilder.build<Viewport3DPaneStripe>({ domClassName: "viewport-3d-pane-stripe" });
		if (!stripe) {
			console.error("Could not build Viewport3DStripe!")
			return viewport3DPane;
		}
		viewport3DPane.appendChild(stripe);
		viewport3DPane.stripe = stripe;

		const content = this.windowUIBuilder.build<Viewport3DPaneContent>({ domClassName: "viewport-3d-pane-content" });
		if (!content) {
			console.log("Could not build Viewport3DPaneContent");
			return viewport3DPane;
		}
		viewport3DPane.appendChild(content);
		viewport3DPane.content = content;

		viewport3DPane.setAttribute("tabindex", "-1");
		return viewport3DPane;
	}

	protected _initWindowComponentStyles(): void {
		this.addStyle(css);
	}
}

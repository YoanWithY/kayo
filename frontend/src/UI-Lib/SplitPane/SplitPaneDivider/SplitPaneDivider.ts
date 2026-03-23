import { IOAPI } from "../../../IO-Interface/IOAPI";
import { UIElementBuilder } from "../../UIElementBuilder";
import { commaSeperatedStringToNumberArray } from "../../UIUtils";
import css from "./SplitPaneDivider.css?inline";

export class SplitPaneDivider extends HTMLElement {
	public static size = parseFloat(
		getComputedStyle(document.documentElement).getPropertyValue("--split-pane-divider-size").replace("px", ""),
	);

	public static getColor() {
		return commaSeperatedStringToNumberArray(
			getComputedStyle(document.documentElement).getPropertyValue("--split-pane-divider-color"),
		);
	}
}

export class SplitPaneDividerBuilder<T extends IOAPI> extends UIElementBuilder<T, SplitPaneDivider> {
	protected _domClassName = "split-pane-divider";

	protected get _domClass() {
		return SplitPaneDivider;
	}

	public build(config: { domClassName: string, orientation: string }): SplitPaneDivider {
		const splitPaneDivider = this.createElement<SplitPaneDivider>(this._domClassName);
		splitPaneDivider.setAttribute("split-pane-divider-orientation", config.orientation);

		const grabber = this.windowUIBuilder.build({ domClassName: "split-pane-grabber" });
		if (!grabber) {
			console.error("Could not build Grabber!")
			return splitPaneDivider;
		}
		grabber.setAttribute("split-pane-divider-orientation", config.orientation);
		splitPaneDivider.appendChild(grabber);

		return splitPaneDivider;
	}

	protected _initWindowComponentStyles(): void {
		this.addStyle(css);
	}
}


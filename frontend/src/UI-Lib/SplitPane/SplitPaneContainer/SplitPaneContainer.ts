import { IOAPI } from "../../../IO-Interface/IOAPI";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { UIElementBuilder } from "../../UIElementBuilder";
import { SplitablePane } from "../SplitablePane/SplitablePane";
import { SplitPaneDivider } from "../SplitPaneDivider/SplitPaneDivider";
import css from "./SplitPaneContainer.css?inline";

export class SplitPaneContainer extends HTMLElement {
	public minHeight() {
		return Number.parseInt(this.style.minHeight.replace("px", ""));
	}

	public minWidth() {
		return Number.parseInt(this.style.minWidth.replace("px", ""));
	}

	public updateSizesRecursively() {
		const orientation = this.getAttribute("split-pane-container-orientation");
		if (orientation == "none") {
			const child = this.firstElementChild;
			if (child instanceof HTMLElement) {
				child.style.width = "";
				child.style.height = "";
			}
			this.style.minWidth = "32px";
			this.style.minHeight = "32px";
		} else if (orientation == "vertical") {
			let minWidth = 0;
			let minHeight = 0;
			for (const sp of this.childNodes) {
				if (sp instanceof SplitablePane || sp instanceof SplitPaneContainer) {
					sp.style.height = "";
					if (sp.nextElementSibling) {
						sp.style.width = sp.getBoundingClientRect().width + "px";
					} else {
						sp.style.width = sp.getBoundingClientRect().width + "px";
					}
					if (sp instanceof SplitPaneContainer) sp.updateSizesRecursively();

					minHeight = Math.max(minHeight, sp.minHeight());
					minWidth += sp.minWidth();
				} else if (sp instanceof SplitPaneDivider) {
					minWidth += SplitPaneDivider.size;
				}
			}
			this.style.minWidth = minWidth + "px";
			this.style.minHeight = minHeight + "px";
		} else {
			let minWidth = 0;
			let minHeight = 0;
			for (const sp of this.childNodes) {
				if (sp instanceof SplitablePane || sp instanceof SplitPaneContainer) {
					sp.style.width = "";
					if (sp.nextElementSibling) {
						sp.style.height = sp.getBoundingClientRect().height + "px";
					} else {
						sp.style.height = sp.getBoundingClientRect().height + "px";
					}
					if (sp instanceof SplitPaneContainer) sp.updateSizesRecursively();

					minHeight += sp.minHeight();
					minWidth = Math.max(minWidth, sp.minWidth());
				} else if (sp instanceof SplitPaneDivider) {
					minHeight += SplitPaneDivider.size;
				}
			}
			this.style.minWidth = minWidth + "px";
			this.style.minHeight = minHeight + "px";
		}
	}
}

export class SplitPaneContainerBuilder<T extends IOAPI> extends UIElementBuilder<T, SplitPaneContainer> {
	protected _domClassName = "split-pane-container";
	protected get _domClass(): CustomElementConstructor {
		return SplitPaneContainer;
	}

	public build(config: { domClassName: string, orientation: string, rect: DOMRect }) {
		const c = this.createElement<SplitPaneContainer>(this._domClassName);
		c.setAttribute("split-pane-container-orientation", config.orientation);
		if (config.orientation == "vertical") {
			c.style.height = config.rect.height + "px";
		} else {
			c.style.width = config.rect.width + "px";
		}
		return c;
	}

	protected _initWindowComponentStyles(): void {
		this.addStyle(css);
	}

	public createRoot(winUIBuilder: WindowUIBuilder<T>, config: { uiRoot: HTMLElement, defaultElementClassName: string }) {
		const rootSplitPaneContainer = this.createElement<SplitPaneContainer>(this._domClassName);
		rootSplitPaneContainer.setAttribute("split-pane-container-orientation", "none");
		rootSplitPaneContainer.setAttribute("id", "libUIWrapper");

		const splitablePane = winUIBuilder.build<SplitablePane<T>>({ domClassName: "splitable-pane", uiRoot: config.uiRoot, paneDomClassName: config.defaultElementClassName });
		if (!splitablePane) {
			console.error("Could not create splitable pane!")
			return rootSplitPaneContainer;
		}
		rootSplitPaneContainer.appendChild(splitablePane);
		return rootSplitPaneContainer;
	}
}

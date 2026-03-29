import { IOAPI } from "../../../IO-Interface/IOAPI";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { UIElementBuilder } from "../../UIElementBuilder";
import { SplitablePane } from "../SplitablePane/SplitablePane";
import css from "./SplitPaneContainer.css?inline";
import { splitPaneDividerSize } from "../SplitPaneDivider/SplitPaneDivider";

export class SplitPaneContainer extends HTMLElement {
	public splitPandeDividerSize!: number;
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
			for (const node of this.childNodes) {
				if (node.nodeName === "SPLITABLE-PANE" || node.nodeName === "SPLIT-PANE-CONTAINER") {
					const sp = node as SplitablePane<any> || SplitPaneContainer;
					sp.style.height = "";
					if (sp.nextElementSibling) {
						sp.style.width = sp.getBoundingClientRect().width + "px";
					} else {
						sp.style.width = sp.getBoundingClientRect().width + "px";
					}
					if (sp.nodeName === "SPLIT-PANE-CONTAINER")
						(sp as unknown as SplitPaneContainer).updateSizesRecursively();

					minHeight = Math.max(minHeight, sp.minHeight());
					minWidth += sp.minWidth();
				}
				else if (node.nodeName === "SPLIT-PANE-DIVIDER") {
					minWidth += this.splitPandeDividerSize;
				}
			}
			this.style.minWidth = minWidth + "px";
			this.style.minHeight = minHeight + "px";
		} else {
			let minWidth = 0;
			let minHeight = 0;
			for (const node of this.childNodes) {
				if (node.nodeName === "SPLITABLE-PANE" || node.nodeName === "SPLIT-PANE-CONTAINER") {
					const sp = node as SplitablePane<any> || SplitPaneContainer;
					sp.style.width = "";
					if (sp.nextElementSibling) {
						sp.style.height = sp.getBoundingClientRect().height + "px";
					} else {
						sp.style.height = sp.getBoundingClientRect().height + "px";
					}
					if (sp.nodeName === "SPLIT-PANE-CONTAINER")
						(sp as unknown as SplitPaneContainer).updateSizesRecursively();

					minHeight += sp.minHeight();
					minWidth = Math.max(minWidth, sp.minWidth());
				} else if (node.nodeName === "SPLIT-PANE-DIVIDER") {
					minWidth += this.splitPandeDividerSize;
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

	public build(windowUIBuilder: WindowUIBuilder<T>, config: { domClassName: string, orientation: string, rect: DOMRect }) {
		const splitPaneContainer = windowUIBuilder.createElement<SplitPaneContainer>(this._domClassName);
		splitPaneContainer.setAttribute("split-pane-container-orientation", config.orientation);
		splitPaneContainer.splitPandeDividerSize = splitPaneDividerSize;
		if (config.orientation == "vertical") {
			splitPaneContainer.style.height = config.rect.height + "px";
		} else {
			splitPaneContainer.style.width = config.rect.width + "px";
		}
		return splitPaneContainer;
	}

	protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<T>): void {
		windowUIBuilder.addStyle(css);
	}

	public createRoot(winUIBuilder: WindowUIBuilder<T>, config: { uiRoot: HTMLElement, defaultElementClassName: string }) {
		const rootSplitPaneContainer = winUIBuilder.createElement<SplitPaneContainer>(this._domClassName);
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

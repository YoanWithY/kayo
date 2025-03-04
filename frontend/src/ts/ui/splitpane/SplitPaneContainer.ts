import { PTPChatPane } from "../../collaborative/PTPChatPannel";
import { PageContext } from "../../PageContext";
import { PaneStripe } from "../panes/PaneStripe";
import { ViewportPane } from "../panes/ViewportPane";
import { WrappingPane } from "../Wrapping/WrappingPane";
import { SplitablePane } from "./SplitablePane";
import { SplitPaneDivider } from "./SplitPaneDivider";

function isMobile() {
	const userAgent = navigator.userAgent.toLowerCase(); // Convert to lowercase for case-insensitivity
	return userAgent.includes("mobile");
}

export class SplitPaneContainer extends HTMLElement {
	static createSplitPaneContainer(win: Window, orientation: string, rect: DOMRect) {
		const c = win.document.createElement("split-pane-container");
		c.setAttribute("split-pane-container-orientation", orientation);
		if (orientation == "vertical") {
			c.style.height = rect.height + "px";
		} else {
			c.style.width = rect.width + "px";
		}

		return c;
	}

	static createRoot(win: Window, pageContext: PageContext, uiRoot: WrappingPane) {
		const c = win.document.createElement("split-pane-container");
		c.setAttribute("split-pane-container-orientation", "none");
		c.setAttribute("id", "wrapper");

		c.appendChild(SplitablePane.createSplitablePane(win, pageContext, uiRoot, isMobile() ? PTPChatPane : ViewportPane));
		return c as SplitPaneContainer;
	}

	minHeight() {
		return Number.parseInt(this.style.minHeight.replace("px", ""));
	}

	minWidth() {
		return Number.parseInt(this.style.minWidth.replace("px", ""));
	}

	updateSizesRecursively() {
		const orientation = this.getAttribute("split-pane-container-orientation");
		if (orientation == "none") {
			const child = this.firstElementChild;
			if (child instanceof HTMLElement) {
				child.style.width = "";
				child.style.height = "";
			}
			this.style.minWidth = PaneStripe.size2 + "px";
			this.style.minHeight = PaneStripe.size2 + "px";
		} else if (orientation == "vertical") {
			let minWidth = 0;
			let minHeight = 0;
			this.childNodes.forEach((sp) => {
				if (sp instanceof SplitablePane || sp instanceof SplitPaneContainer) {
					sp.style.height = "";
					if (sp.nextElementSibling) {
						sp.style.width = sp.getBoundingClientRect().width + "px";
					} else {
						sp.style.width = sp.getBoundingClientRect().width + "px";
					}
					if (sp instanceof SplitPaneContainer)
						sp.updateSizesRecursively();

					minHeight = Math.max(minHeight, sp.minHeight());
					minWidth += sp.minWidth();
				} else if (sp instanceof SplitPaneDivider) {
					minWidth += SplitPaneDivider.size;
				}
			});
			this.style.minWidth = minWidth + "px";
			this.style.minHeight = minHeight + "px";

		} else {
			let minWidth = 0;
			let minHeight = 0;
			this.childNodes.forEach((sp) => {
				if (sp instanceof SplitablePane || sp instanceof SplitPaneContainer) {
					sp.style.width = "";

					if (sp.nextElementSibling) {
						sp.style.height = sp.getBoundingClientRect().height + "px";
					} else {
						sp.style.height = sp.getBoundingClientRect().height + "px";
					}
					if (sp instanceof SplitPaneContainer)
						sp.updateSizesRecursively();

					minHeight += sp.minHeight();
					minWidth = Math.max(minWidth, sp.minWidth());
				} else if (sp instanceof SplitPaneDivider) {
					minHeight += SplitPaneDivider.size;
				}
			});
			this.style.minWidth = minWidth + "px";
			this.style.minHeight = minHeight + "px";
		}
	}
}
import { PaneStripe } from "../panes/PaneStripe";
import { commaSeperatedStringToNumberArray } from "../UIUtils";
import { SplitablePane } from "./SplitablePane";
import { SplitPaneContainer } from "./SplitPaneContainer";

export class SplitPaneDivider extends HTMLElement {
	static color = commaSeperatedStringToNumberArray(getComputedStyle(document.documentElement).getPropertyValue("--split-pane-divider-color"));
	static size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--split-pane-divider-size").replace("px", ""));
	isMouseDown = 0;
	constructor() {
		super();

		const mD = () => {
			this.isMouseDown = 1;
			document.body.addEventListener('mousemove', mV);
			document.body.addEventListener('mouseup', end);
		}

		const mV = (e: MouseEvent) => {
			e.preventDefault();
			if (this.isMouseDown === 1) {
				const parent = this.parentElement;
				if (!(parent instanceof SplitPaneContainer))
					return;

				const prev = this.previousElementSibling;
				if (!(prev instanceof SplitPaneContainer || prev instanceof SplitablePane))
					return;

				const next = this.nextElementSibling;
				if (!(next instanceof SplitPaneContainer || next instanceof SplitablePane))
					return;

				const prevBB = prev.getBoundingClientRect();
				const nextBB = next.getBoundingClientRect();

				if (parent.getAttribute("split-pane-container-orientation") == "vertical") {

					let prevNewWidth = Math.floor(Math.max(e.clientX - prevBB.x, prev.minWidth()));
					let nextNewWidth = Math.floor(nextBB.width + (prevBB.width - prevNewWidth));
					if (nextNewWidth < PaneStripe.size2) {
						prevNewWidth -= PaneStripe.size2 - nextNewWidth;
						nextNewWidth = PaneStripe.size2;
					}
					prev.style.width = prevNewWidth + "px";
					next.style.width = nextNewWidth + "px";
				} else {
					let prevNewHeight = Math.floor(Math.max(e.clientY - prevBB.y, prev.minHeight()));
					let nextNewHeight = Math.floor(nextBB.height + (prevBB.height - prevNewHeight));

					if (nextNewHeight < PaneStripe.size2) {
						prevNewHeight -= PaneStripe.size2 - nextNewHeight;
						nextNewHeight = PaneStripe.size2;
					}

					prev.style.height = prevNewHeight + "px";
					next.style.height = nextNewHeight + "px";
				}
			} else
				end();
		}
		const end = () => {
			this.isMouseDown = 0;
			document.body.removeEventListener('mouseup', end);
			this.removeEventListener('mousemove', mV);
		}

		this.addEventListener("mousedown", mD);
	}

	static createSplitPaneDivider(orientation: string) {
		const spd = document.createElement("split-pane-divider");
		spd.setAttribute("split-pane-divider-orientation", orientation);
		return spd;
	}
}
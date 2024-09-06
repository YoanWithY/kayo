import { openProject } from "../../project/Project";
import { PaneStripe } from "../panes/PaneStripe";
import { commaSeperatedStringToNumberArray } from "../UIUtils";
import { SplitablePane } from "./SplitablePane";
import { SplitPaneContainer } from "./SplitPaneContainer";

export class SplitPaneDivider extends HTMLElement {
	static size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--split-pane-divider-size").replace("px", ""));
	constructor() {
		super();

	}

	static createSplitPaneDivider(orientation: string) {
		const spd = document.createElement("split-pane-divider");
		spd.setAttribute("split-pane-divider-orientation", orientation);

		const grabber = document.createElement("split-pane-grabber");
		grabber.setAttribute("split-pane-divider-orientation", orientation);
		spd.appendChild(grabber);

		return spd;
	}

	static getColor() {
		return commaSeperatedStringToNumberArray(getComputedStyle(document.documentElement).getPropertyValue("--split-pane-divider-color"))
	};
}

export class SplitPaneGrabber extends HTMLElement {
	isMouseDown = 0;
	constructor() {
		super();
		const mouseMove = (e: MouseEvent) => {
			e.preventDefault();
			if (this.isMouseDown === 1) {
				const divider = this.parentElement;
				if (!(divider instanceof SplitPaneDivider))
					return;

				const parent = divider.parentElement;
				if (!(parent instanceof SplitPaneContainer))
					return;

				const prev = divider.previousElementSibling;
				if (!(prev instanceof SplitPaneContainer || prev instanceof SplitablePane))
					return;

				const next = divider.nextElementSibling;
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
			document.body.removeEventListener('mousemove', mouseMove);
			document.body.removeEventListener('mouseup', end);
		}

		this.addEventListener("mousedown", () => {
			this.isMouseDown = 1;
			document.body.addEventListener('mousemove', mouseMove);
			document.body.addEventListener('mouseup', end);
		});
	}
}
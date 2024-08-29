import { openProject } from "../../project/Project";
import PaneSelectorPane from "../panes/PaneSelectorPane";
import { SplitablePane } from "./SplitablePane";
import { SplitPaneContainer } from "./SplitPaneContainer";
import { SplitPaneDivider } from "./SplitPaneDivider";

export abstract class SplitButton extends HTMLElement {

	clickX = NaN;
	clickY = NaN;
	constructor() {
		super();
		this.ondragstart = () => { return false; };
		this.onmousedown = e => {
			this.clickX = e.screenX;
			this.clickY = e.screenY;
		}
	}

	static checkContainerForSingle(container: SplitPaneContainer, splitablePane: SplitablePane) {
		if (container.childElementCount == 1) {
			if (container.getAttribute("id") == "wrapper") {
				container.setAttribute("split-pane-container-orientation", "none");
				return;
			}

			const containerParent = container.parentElement;
			if (!(containerParent instanceof SplitPaneContainer))
				throw new Error("container parent is not of type SplitPaneContainer");

			const co = container.getAttribute("split-pane-container-orientation");
			if (co == "vertical") {
				splitablePane.style.width = "";
				splitablePane.style.height = container.getBoundingClientRect().height + "px";
			} else {
				splitablePane.style.width = container.getBoundingClientRect().width + "px";
				splitablePane.style.height = "";
			}
			containerParent.replaceChild(splitablePane, container);
		}
	}

	static prepSplitablePanes(orientation: string, p1: SplitablePane, p2: SplitablePane, bb: DOMRect) {
		if (orientation == "vertical") {
			const width = (bb.width - SplitPaneDivider.size) / 2 + "px";
			p1.style.width = width;
			p2.style.width = width;
		} else {
			const height = (bb.height - SplitPaneDivider.size) / 2 + "px";
			p1.style.height = height;
			p2.style.height = height;
		}
	}
}

export class SplitButtonUL extends SplitButton {
	private left(e: MouseEvent) {
		if (isNaN(this.clickX) || isNaN(this.clickY))
			return;

		const dx = e.screenX - this.clickX;
		const dy = e.screenY - this.clickY;

		this.clickX = NaN;
		this.clickY = NaN;

		const splitablePane = this.parentElement;
		if (!(splitablePane instanceof SplitablePane))
			throw new Error("splitable pane has no parent");

		const container = splitablePane.parentElement;
		if (!(container instanceof SplitPaneContainer))
			throw new Error("splitable panes parent is not of type SplitablePaneContainer");

		let spo = container.getAttribute("split-pane-container-orientation");

		if (dx >= 0 && Math.abs(dy) <= dx || dy >= 0 && Math.abs(dx) <= dy) { // create new window
			const orientation = dx >= dy ? "vertical" : "horizontal";

			const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
			const newSplitablePane = SplitablePane.createSplitablePane(PaneSelectorPane.createPaneSelectorPane, orientation, splitablePane.getBoundingClientRect());
			const bb = splitablePane.getBoundingClientRect();
			SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

			if (spo == "none") {
				container.setAttribute("split-pane-container-orientation", orientation);
				spo = orientation;
			}

			if (spo == orientation) { // append to splitpane container
				splitablePane.before(newSplitablePane, spDivider);
			} else { // insert new splitpane container
				const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
				container.insertBefore(newContainer, splitablePane);
				newContainer.append(newSplitablePane, spDivider, splitablePane);
			}
		} else if (dx <= dy && spo == "vertical" || dy <= dx && spo == "horizontal") { // remove window
			splitablePane.removePrevious(container, spo);
			SplitButton.checkContainerForSingle(container, splitablePane);
		}
		openProject.uiRoot.updateSizesRecursively();
	}

	constructor() {
		super();
		this.onmouseleave = this.left;
	}
}

export class SplitButtonUR extends SplitButton {

	private left(e: MouseEvent) {
		if (isNaN(this.clickX) || isNaN(this.clickY))
			return

		const dx = e.screenX - this.clickX;
		const dy = e.screenY - this.clickY;

		this.clickX = NaN;
		this.clickY = NaN;

		const splitablePane = this.parentElement;
		if (!(splitablePane instanceof SplitablePane))
			throw new Error("splitable pane has no parent");

		const container = splitablePane.parentElement;
		if (!(container instanceof SplitPaneContainer))
			throw new Error("splitable panes parent is not a SplitPaneContainer");

		let spo = container.getAttribute("split-pane-container-orientation");

		if (dx <= 0 && Math.abs(dy) <= Math.abs(dx) || dy >= 0 && Math.abs(dx) <= dy) { // create new window
			const orientation = Math.abs(dx) >= dy ? "vertical" : "horizontal";

			const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
			const newSplitablePane = SplitablePane.createSplitablePane(PaneSelectorPane.createPaneSelectorPane, orientation, splitablePane.getBoundingClientRect());
			const bb = splitablePane.getBoundingClientRect();
			SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

			if (spo == "none") {
				container.setAttribute("split-pane-container-orientation", orientation);
				spo = orientation;
			}

			if (spo == orientation) {// append to splitpane container
				if (spo == "vertical") {
					splitablePane.after(spDivider, newSplitablePane);
				} else {
					splitablePane.before(newSplitablePane, spDivider);
				}
			} else { // insert new splitpane container
				const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
				container.insertBefore(newContainer, splitablePane);
				if (orientation == "vertical")
					newContainer.append(splitablePane, spDivider, newSplitablePane);
				else
					newContainer.append(newSplitablePane, spDivider, splitablePane);

			}
		} else { // remove window
			if (dx >= Math.abs(dy) && spo == "vertical") {
				splitablePane.removeNext(container, spo);
			} else if (dy <= Math.abs(dx) && spo == "horizontal") {
				splitablePane.removePrevious(container, spo);
			}
			SplitButton.checkContainerForSingle(container, splitablePane);
		}
		openProject.uiRoot.updateSizesRecursively();
	}

	constructor() {
		super();
		this.onmouseleave = this.left;
	}
}

export class SplitButtonLL extends SplitButton {

	private left(e: MouseEvent) {
		if (isNaN(this.clickX) || isNaN(this.clickY))
			return

		const dx = e.screenX - this.clickX;
		const dy = e.screenY - this.clickY;

		this.clickX = NaN;
		this.clickY = NaN;

		const splitablePane = this.parentElement;
		if (!(splitablePane instanceof SplitablePane))
			throw new Error("splitable pane has no parent");

		const container = splitablePane.parentElement;
		if (!(container instanceof SplitPaneContainer))
			throw new Error("splitable panes parent is not a SplitPaneContainer");

		let spo = container.getAttribute("split-pane-container-orientation");

		if (dx >= 0 && Math.abs(dy) <= dx || dy <= 0 && Math.abs(dx) <= Math.abs(dy)) { // create new window
			const orientation = Math.abs(dx) >= Math.abs(dy) ? "vertical" : "horizontal";

			const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
			const newSplitablePane = SplitablePane.createSplitablePane(PaneSelectorPane.createPaneSelectorPane, orientation, splitablePane.getBoundingClientRect());
			const bb = splitablePane.getBoundingClientRect();
			SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

			if (spo == "none") {
				container.setAttribute("split-pane-container-orientation", orientation);
				spo = orientation;
			}

			if (spo == orientation) { // append to splitpane container
				if (spo == "vertical") {
					splitablePane.before(newSplitablePane, spDivider);
				} else {
					splitablePane.after(spDivider, newSplitablePane);
				}
			} else { // insert new splitpane container
				const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
				container.replaceChild(newContainer, splitablePane);
				if (orientation == "vertical")
					newContainer.append(newSplitablePane, spDivider, splitablePane);
				else
					newContainer.append(splitablePane, spDivider, newSplitablePane);

			}
		} else {
			if (dx <= Math.abs(dy) && spo == "vertical") { // remove window
				splitablePane.removePrevious(container, spo);
			} else if (dy >= Math.abs(dx) && spo == "horizontal") {
				splitablePane.removeNext(container, spo);
			}
			SplitButton.checkContainerForSingle(container, splitablePane);
		}
		openProject.uiRoot.updateSizesRecursively();
	}

	constructor() {
		super();
		this.onmouseleave = this.left;
	}
}

export class SplitButtonLR extends SplitButton {

	private left(e: MouseEvent) {
		if (isNaN(this.clickX) || isNaN(this.clickY))
			return

		const dx = e.screenX - this.clickX;
		const dy = e.screenY - this.clickY;

		this.clickX = NaN;
		this.clickY = NaN;

		const splitablePane = this.parentElement;
		if (!(splitablePane instanceof SplitablePane))
			throw new Error("splitable pane has no parent");

		const container = splitablePane.parentElement;
		if (!(container instanceof SplitPaneContainer))
			throw new Error("splitable panes parent is null");

		let spo = container.getAttribute("split-pane-container-orientation");

		if (dx <= 0 && Math.abs(dy) <= Math.abs(dx) || dy <= 0 && Math.abs(dx) <= Math.abs(dy)) { // create new window
			const orientation = Math.abs(dx) >= Math.abs(dy) ? "vertical" : "horizontal";

			const spDivider = SplitPaneDivider.createSplitPaneDivider(orientation);
			const newSplitablePane = SplitablePane.createSplitablePane(PaneSelectorPane.createPaneSelectorPane, orientation, splitablePane.getBoundingClientRect());
			const bb = splitablePane.getBoundingClientRect();
			SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

			if (spo == "none") {
				container.setAttribute("split-pane-container-orientation", orientation);
				spo = orientation;
			}

			if (spo == orientation) { // append to splitpane container
				splitablePane.after(spDivider, newSplitablePane);
			} else { // insert new splitpane container
				const newContainer = SplitPaneContainer.createSplitPaneContainer(orientation, bb);
				container.insertBefore(newContainer, splitablePane);
				newContainer.append(splitablePane, spDivider, newSplitablePane);
			}
		} else if (dx >= dy && spo == "vertical" || dy >= dx && spo == "horizontal") { // remove window
			splitablePane.removeNext(container, spo);
			SplitButton.checkContainerForSingle(container, splitablePane);
		}
		openProject.uiRoot.updateSizesRecursively();
	}

	constructor() {
		super();
		this.onmouseleave = this.left;
	}
}
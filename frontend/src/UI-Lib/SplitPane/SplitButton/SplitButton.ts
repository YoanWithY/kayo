import { WrappingPane } from "../WrappingPane/WrappingPane";
import { SplitablePane } from "../SplitablePane/SplitablePane";
import { SplitPaneDivider } from "../SplitPaneDivider/SplitPaneDivider";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { UIElementBuilder } from "../../UIElementBuilder";
import { IOAPI } from "../../../IO-Interface/IOAPI";
import { SplitPaneContainer } from "../SplitPaneContainer/SplitPaneContainer";
import cssUL from "./SplitButtonUL.css?inline";
import cssUR from "./SplitButtonUR.css?inline";
import cssLL from "./SplitButtonLL.css?inline";
import cssLR from "./SplitButtonLR.css?inline";

export abstract class SplitButton<T extends IOAPI> extends HTMLElement {
	public win!: Window;
	public winUIBuilder!: WindowUIBuilder<T>;
	public uiRoot!: WrappingPane;
	protected clickX = NaN;
	protected clickY = NaN;
	protected _dragStartCallback = () => {
		return false;
	};
	protected _pointerDownCallback = (e: PointerEvent) => {
		this.clickX = e.screenX;
		this.clickY = e.screenY;
	};

	protected connectedCallback() {
		this.addEventListener("dragstart", this._dragStartCallback);
		this.addEventListener("pointerdown", this._pointerDownCallback);
	}

	protected disconnectedCallback() {
		this.removeEventListener("dragstart", this._dragStartCallback);
		this.removeEventListener("pointerdown", this._pointerDownCallback);
	}

	public static checkContainerForSingle(container: SplitPaneContainer, splitablePane: SplitablePane<any>) {
		if (container.childElementCount == 1) {
			if (container.getAttribute("id") == "libUIWrapper") {
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

	public static prepSplitablePanes(orientation: string, p1: SplitablePane<any>, p2: SplitablePane<any>, bb: DOMRect) {
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

export class SplitButtonUL<T extends IOAPI> extends SplitButton<T> {
	private left(e: PointerEvent) {
		if (isNaN(this.clickX) || isNaN(this.clickY)) return;

		const dx = e.screenX - this.clickX;
		const dy = e.screenY - this.clickY;

		this.clickX = NaN;
		this.clickY = NaN;

		const splitablePane = this.parentElement;
		if (!(splitablePane instanceof SplitablePane)) throw new Error("splitable pane has no parent");

		const container = splitablePane.parentElement;
		if (!(container instanceof SplitPaneContainer))
			throw new Error("splitable panes parent is not of type SplitablePaneContainer");

		let spo = container.getAttribute("split-pane-container-orientation");

		if ((dx >= 0 && Math.abs(dy) <= dx) || (dy >= 0 && Math.abs(dx) <= dy)) {
			// create new window
			const orientation = dx >= dy ? "vertical" : "horizontal";

			const newSplitablePane = this.winUIBuilder.build<SplitablePane<T>>(
				{
					domClassName: "splitable-pane",
					uiRoot: this.uiRoot,
					paneDomClassName: "pane-selector-pane",
					stripeDomClassName: "basic-stripe",
					orientation,
					rect: splitablePane.getBoundingClientRect()
				}
			);
			if (!newSplitablePane) {
				console.error("Could not create new SplitablePane!")
				return;
			}

			const bb = splitablePane.getBoundingClientRect();
			SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

			if (spo == "none") {
				container.setAttribute("split-pane-container-orientation", orientation);
				spo = orientation;
			}

			const spDivider = this.winUIBuilder.build<SplitPaneDivider>({ domClassName: "split-pane-divider", orientation });
			if (!spDivider) {
				console.error("Could not build SplitPaneDevider!");
				return;
			}

			if (spo == orientation) {
				// append to splitpane container
				splitablePane.before(newSplitablePane, spDivider);
			} else {
				// insert new splitpane container
				const newContainer = this.winUIBuilder.build<SplitPaneContainer>({ domClassName: "split-pane-container", orientation, rect: bb });
				if (!newContainer) {
					console.error("Could not build SplitPaneContainer!");
					return;
				}

				container.insertBefore(newContainer, splitablePane);
				newContainer.append(newSplitablePane, spDivider, splitablePane);
			}
		} else if ((dx <= dy && spo == "vertical") || (dy <= dx && spo == "horizontal")) {
			// remove window
			splitablePane.removePrevious(container, spo);
			SplitButton.checkContainerForSingle(container, splitablePane);
		}
		this.uiRoot.baseSplitPaneContainer.updateSizesRecursively();
	}

	public constructor() {
		super();
		this.onpointerleave = this.left;
	}
}

export class SplitButtonULBuilder<T extends IOAPI> extends UIElementBuilder<T, SplitButtonUL<T>> {
	protected _domClassName = "split-button-ul";

	protected get _domClass() {
		return SplitButtonUL;
	}

	public build(config: { domClassName: string, uiRoot: WrappingPane }) {
		const sb = this.createElement<SplitButtonUL<T>>(this._domClassName);
		sb.winUIBuilder = this.windowUIBuilder;
		sb.uiRoot = config.uiRoot;
		return sb;
	}

	protected _initWindowComponentStyles() {
		this.addStyle(cssUL);
	}
}

export class SplitButtonUR<T extends IOAPI> extends SplitButton<T> {
	private left(e: PointerEvent) {
		if (isNaN(this.clickX) || isNaN(this.clickY)) return;

		const dx = e.screenX - this.clickX;
		const dy = e.screenY - this.clickY;

		this.clickX = NaN;
		this.clickY = NaN;

		const splitablePane = this.parentElement;
		if (!(splitablePane instanceof SplitablePane)) throw new Error("splitable pane has no parent");

		const container = splitablePane.parentElement;
		if (!(container instanceof SplitPaneContainer))
			throw new Error("splitable panes parent is not a SplitPaneContainer");

		let spo = container.getAttribute("split-pane-container-orientation");

		if ((dx <= 0 && Math.abs(dy) <= Math.abs(dx)) || (dy >= 0 && Math.abs(dx) <= dy)) {
			// create new window
			const orientation = Math.abs(dx) >= dy ? "vertical" : "horizontal";

			const newSplitablePane = this.winUIBuilder.build<SplitablePane<T>>(
				{
					domClassName: "splitable-pane",
					uiRoot: this.uiRoot,
					paneDomClassName: "pane-selector-pane",
					stripeDomClassName: "basic-stripe",
					orientation,
					rect: splitablePane.getBoundingClientRect()
				}
			);
			if (!newSplitablePane) {
				console.error("Could not create new SplitablePane!")
				return;
			}

			const bb = splitablePane.getBoundingClientRect();
			SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

			if (spo == "none") {
				container.setAttribute("split-pane-container-orientation", orientation);
				spo = orientation;
			}

			const spDivider = this.winUIBuilder.build<SplitPaneDivider>({ domClassName: "split-pane-divider", orientation });
			if (!spDivider) {
				console.error("Could not build SplitPaneDevider!");
				return;
			}

			if (spo == orientation) {
				// append to splitpane container
				if (spo == "vertical") {
					splitablePane.after(spDivider, newSplitablePane);
				} else {
					splitablePane.before(newSplitablePane, spDivider);
				}
			} else {
				// insert new splitpane container
				const newContainer = this.winUIBuilder.build<SplitPaneContainer>({ domClassName: "split-pane-container", orientation, rect: bb });
				if (!newContainer) {
					console.error("Could not build SplitPaneContainer!");
					return;
				}

				container.insertBefore(newContainer, splitablePane);
				if (orientation == "vertical") newContainer.append(splitablePane, spDivider, newSplitablePane);
				else newContainer.append(newSplitablePane, spDivider, splitablePane);
			}
		} else {
			// remove window
			if (dx >= Math.abs(dy) && spo == "vertical") {
				splitablePane.removeNext(container, spo);
			} else if (dy <= Math.abs(dx) && spo == "horizontal") {
				splitablePane.removePrevious(container, spo);
			}
			SplitButton.checkContainerForSingle(container, splitablePane);
		}
		this.uiRoot.baseSplitPaneContainer.updateSizesRecursively();
	}

	public constructor() {
		super();
		this.onpointerleave = this.left;
	}
}

export class SplitButtonURBuilder<T extends IOAPI> extends UIElementBuilder<T, SplitButtonUR<T>> {
	protected _domClassName = "split-button-ur";

	protected get _domClass() {
		return SplitButtonUR;
	}

	public build(config: { domClassName: string, uiRoot: WrappingPane }) {
		const sb = this.createElement<SplitButtonUR<T>>(this._domClassName);
		sb.winUIBuilder = this.windowUIBuilder;
		sb.uiRoot = config.uiRoot;
		return sb;
	}

	protected _initWindowComponentStyles() {
		this.addStyle(cssUR);
	}
}

export class SplitButtonLL<T extends IOAPI> extends SplitButton<T> {
	private left(e: PointerEvent) {
		if (isNaN(this.clickX) || isNaN(this.clickY)) return;

		const dx = e.screenX - this.clickX;
		const dy = e.screenY - this.clickY;

		this.clickX = NaN;
		this.clickY = NaN;

		const splitablePane = this.parentElement;
		if (!(splitablePane instanceof SplitablePane)) throw new Error("splitable pane has no parent");

		const container = splitablePane.parentElement;
		if (!(container instanceof SplitPaneContainer))
			throw new Error("splitable panes parent is not a SplitPaneContainer");

		let spo = container.getAttribute("split-pane-container-orientation");

		if ((dx >= 0 && Math.abs(dy) <= dx) || (dy <= 0 && Math.abs(dx) <= Math.abs(dy))) {
			// create new window
			const orientation = Math.abs(dx) >= Math.abs(dy) ? "vertical" : "horizontal";

			const newSplitablePane = this.winUIBuilder.build<SplitablePane<T>>(
				{
					domClassName: "splitable-pane",
					uiRoot: this.uiRoot,
					paneDomClassName: "pane-selector-pane",
					stripeDomClassName: "basic-stripe",
					orientation,
					rect: splitablePane.getBoundingClientRect()
				}
			);
			if (!newSplitablePane) {
				console.error("Could not create new SplitablePane!")
				return;
			}

			const bb = splitablePane.getBoundingClientRect();
			SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

			if (spo == "none") {
				container.setAttribute("split-pane-container-orientation", orientation);
				spo = orientation;
			}

			const spDivider = this.winUIBuilder.build<SplitPaneDivider>({ domClassName: "split-pane-divider", orientation });
			if (!spDivider) {
				console.error("Could not build SplitPaneDevider!");
				return;
			}

			if (spo == orientation) {
				// append to splitpane container
				if (spo == "vertical") {
					splitablePane.before(newSplitablePane, spDivider);
				} else {
					splitablePane.after(spDivider, newSplitablePane);
				}
			} else {
				// insert new splitpane container
				const newContainer = this.winUIBuilder.build<SplitPaneContainer>({ domClassName: "split-pane-container", orientation, rect: bb });
				if (!newContainer) {
					console.error("Could not build SplitPaneContainer!");
					return;
				}

				container.replaceChild(newContainer, splitablePane);
				if (orientation == "vertical") newContainer.append(newSplitablePane, spDivider, splitablePane);
				else newContainer.append(splitablePane, spDivider, newSplitablePane);
			}
		} else {
			if (dx <= Math.abs(dy) && spo == "vertical") {
				// remove window
				splitablePane.removePrevious(container, spo);
			} else if (dy >= Math.abs(dx) && spo == "horizontal") {
				splitablePane.removeNext(container, spo);
			}
			SplitButton.checkContainerForSingle(container, splitablePane);
		}
		this.uiRoot.baseSplitPaneContainer.updateSizesRecursively();
	}

	public constructor() {
		super();
		this.onpointerleave = this.left;
	}
}

export class SplitButtonLLBuilder<T extends IOAPI> extends UIElementBuilder<T, SplitButtonLL<T>> {
	protected _domClassName = "split-button-ll";

	protected get _domClass() {
		return SplitButtonLL;
	}

	public build(config: { domClassName: string, uiRoot: WrappingPane }) {
		const sb = this.createElement<SplitButtonLL<T>>(this._domClassName);
		sb.winUIBuilder = this.windowUIBuilder;
		sb.uiRoot = config.uiRoot;
		return sb;
	}

	protected _initWindowComponentStyles() {
		this.addStyle(cssLL);
	}
}

export class SplitButtonLR<T extends IOAPI> extends SplitButton<T> {
	private left(e: PointerEvent) {
		if (isNaN(this.clickX) || isNaN(this.clickY)) return;

		const dx = e.screenX - this.clickX;
		const dy = e.screenY - this.clickY;

		this.clickX = NaN;
		this.clickY = NaN;

		const splitablePane = this.parentElement;
		if (!(splitablePane instanceof SplitablePane)) throw new Error("splitable pane has no parent");

		const container = splitablePane.parentElement;
		if (!(container instanceof SplitPaneContainer)) throw new Error("splitable panes parent is null");

		let spo = container.getAttribute("split-pane-container-orientation");

		if ((dx <= 0 && Math.abs(dy) <= Math.abs(dx)) || (dy <= 0 && Math.abs(dx) <= Math.abs(dy))) {
			// create new window
			const orientation = Math.abs(dx) >= Math.abs(dy) ? "vertical" : "horizontal";

			const newSplitablePane = this.winUIBuilder.build<SplitablePane<T>>(
				{
					domClassName: "splitable-pane",
					uiRoot: this.uiRoot,
					paneDomClassName: "pane-selector-pane",
					stripeDomClassName: "basic-stripe",
					orientation,
					rect: splitablePane.getBoundingClientRect()
				}
			);
			if (!newSplitablePane) {
				console.error("Could not create new SplitablePane!")
				return;
			}

			const bb = splitablePane.getBoundingClientRect();
			SplitButton.prepSplitablePanes(orientation, splitablePane, newSplitablePane, bb);

			if (spo == "none") {
				container.setAttribute("split-pane-container-orientation", orientation);
				spo = orientation;
			}

			const spDivider = this.winUIBuilder.build<SplitPaneDivider>({ domClassName: "split-pane-divider", orientation });
			if (!spDivider) {
				console.error("Could not build SplitPaneDevider!");
				return;
			}

			if (spo == orientation) {
				// append to splitpane container
				splitablePane.after(spDivider, newSplitablePane);
			} else {
				// insert new splitpane container
				const newContainer = this.winUIBuilder.build<SplitPaneContainer>({ domClassName: "split-pane-container", orientation, rect: bb });
				if (!newContainer) {
					console.error("Could not build SplitPaneContainer!");
					return;
				}
				container.insertBefore(newContainer, splitablePane);
				newContainer.append(splitablePane, spDivider, newSplitablePane);
			}
		} else if ((dx >= dy && spo == "vertical") || (dy >= dx && spo == "horizontal")) {
			// remove window
			splitablePane.removeNext(container, spo);
			SplitButton.checkContainerForSingle(container, splitablePane);
		}
		this.uiRoot.baseSplitPaneContainer.updateSizesRecursively();
	}

	public constructor() {
		super();
		this.onpointerleave = this.left;
	}
}

export class SplitButtonLRBuilder<T extends IOAPI> extends UIElementBuilder<T, SplitButtonLR<T>> {
	protected _domClassName = "split-button-lr";

	protected get _domClass() {
		return SplitButtonLR;
	}

	public build(config: { domClassName: string, uiRoot: WrappingPane }) {
		const sb = this.createElement<SplitButtonLR<T>>(this._domClassName);
		sb.winUIBuilder = this.windowUIBuilder;
		sb.uiRoot = config.uiRoot;
		return sb;
	}

	protected _initWindowComponentStyles() {
		this.addStyle(cssLR);
	}
}

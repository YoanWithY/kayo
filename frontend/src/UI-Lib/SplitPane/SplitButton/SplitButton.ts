import { WrappingPane } from "../WrappingPane/WrappingPane";
import { SplitablePane } from "../SplitablePane/SplitablePane";
import { SplitPaneDivider, splitPaneDividerSize } from "../SplitPaneDivider/SplitPaneDivider";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { UIElementBuilder } from "../../UIElementBuilder";
import { IOAPI } from "../../../IO-Interface/IOAPI";
import { SplitPaneContainer } from "../SplitPaneContainer/SplitPaneContainer";
import css from "./SplitButton.css?inline";

export type SplitButtonType = "UL" | "UR" | "LL" | "LR";

export class SplitButton<T extends IOAPI> extends HTMLElement {
	public win!: Window;
	public winUIBuilder!: WindowUIBuilder<T>;
	public uiRoot!: WrappingPane;
	public type!: SplitButtonType
	public splitPaneDividerSize!: number;
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
		this.addEventListener("pointerleave", this._onLeave);
	}

	protected disconnectedCallback() {
		this.removeEventListener("dragstart", this._dragStartCallback);
		this.removeEventListener("pointerdown", this._pointerDownCallback);
		this.removeEventListener("pointerleave", this._onLeave);
	}

	public static checkContainerForSingle(container: SplitPaneContainer, splitablePane: SplitablePane<any>) {
		if (container.childElementCount == 1) {
			if (container.getAttribute("id") == "libUIWrapper") {
				container.setAttribute("split-pane-container-orientation", "none");
				return;
			}

			const containerParent = container.parentElement;
			if (!containerParent || containerParent.nodeName !== "SPLIT-PANE-CONTAINER")
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

	public static prepSplitablePanes(orientation: string, p1: SplitablePane<any>, p2: SplitablePane<any>, bb: DOMRect, spdSize: number) {
		if (orientation == "vertical") {
			const width = (bb.width - spdSize) / 2 + "px";
			p1.style.width = width;
			p2.style.width = width;
		} else {
			const height = (bb.height - spdSize) / 2 + "px";
			p1.style.height = height;
			p2.style.height = height;
		}
	}

	private _onLeave(e: PointerEvent) {
		if (isNaN(this.clickX) || isNaN(this.clickY))
			return;

		const dx = e.screenX - this.clickX;
		const dy = e.screenY - this.clickY;

		this.clickX = NaN;
		this.clickY = NaN;

		const splitablePane = this.parentElement as SplitablePane<T> | null;
		if (!splitablePane || splitablePane.nodeName !== "SPLITABLE-PANE")
			throw new Error("splitable pane has no parent");

		const container = splitablePane.parentElement as SplitPaneContainer | null;
		if (!container || container.nodeName !== "SPLIT-PANE-CONTAINER")
			throw new Error("splitable panes parent is not of type SplitablePaneContainer");

		let dir: "left" | "right" | "up" | "down";
		if (dx > 0 && dx >= Math.abs(dy))
			dir = "right";
		else if (dx < 0 && -dx >= Math.abs(dy))
			dir = "left"
		else if (dy > 0 && dy >= Math.abs(dx))
			dir = "down";
		else
			dir = "up";

		let splitPaneContainerOrientation = container.getAttribute("split-pane-container-orientation") as "vertical" | "horizontal" | "none";

		if (
			(this.type === "UL" && (dir === "right" || dir === "down")) ||
			(this.type === "UR" && (dir === "left" || dir === "down")) ||
			(this.type === "LL" && (dir === "right" || dir === "up")) ||
			(this.type === "LR" && (dir === "left" || dir === "up"))
		) {
			const dividerOrientation = dir === "left" || dir === "right" ? "vertical" : "horizontal";

			const newSplitablePane = this.winUIBuilder.build<SplitablePane<T>>(
				{
					domClassName: "splitable-pane",
					uiRoot: this.uiRoot,
					paneDomClassName: "pane-selector-pane",
					stripeDomClassName: "basic-stripe",
					orientation: dividerOrientation,
					rect: splitablePane.getBoundingClientRect()
				}
			);
			if (!newSplitablePane) {
				console.error("Could not create new SplitablePane!")
				return;
			}

			const bb = splitablePane.getBoundingClientRect();
			SplitButton.prepSplitablePanes(dividerOrientation, splitablePane, newSplitablePane, bb, this.splitPaneDividerSize);


			if (splitPaneContainerOrientation == "none") {
				container.setAttribute("split-pane-container-orientation", dividerOrientation);
				splitPaneContainerOrientation = dividerOrientation;
			}

			const splitPaneDivider = this.winUIBuilder.build<SplitPaneDivider>({ domClassName: "split-pane-divider", orientation: dividerOrientation });
			if (!splitPaneDivider) {
				console.error("Could not build SplitPaneDevider!");
				return;
			}

			if (splitPaneContainerOrientation == dividerOrientation) {
				if (
					(dividerOrientation === "vertical" && dir === "right" && (this.type === "UL" || this.type === "LL")) ||
					(dividerOrientation === "horizontal" && dir === "down" && (this.type === "UL" || this.type === "UR"))
				) {
					splitablePane.before(newSplitablePane, splitPaneDivider);
				}
				else {
					splitablePane.after(splitPaneDivider, newSplitablePane);
				}
			} else {
				// insert new splitpane container
				const newContainer = this.winUIBuilder.build<SplitPaneContainer>({ domClassName: "split-pane-container", orientation: dividerOrientation, rect: bb });
				if (!newContainer) {
					console.error("Could not build SplitPaneContainer!");
					return;
				}
				container.replaceChild(newContainer, splitablePane);

				if (
					(dividerOrientation === "horizontal" && dir === "down") ||
					(dividerOrientation === "vertical" && dir === "right")
				) {
					newContainer.append(newSplitablePane, splitPaneDivider, splitablePane);
				}
				else {
					newContainer.append(splitablePane, splitPaneDivider, newSplitablePane);
				}
			}
		}
		else {
			// remove window
			if (
				(this.type === "UL" && dir === "left" && splitPaneContainerOrientation === "vertical") ||
				(this.type === "UL" && dir === "up" && splitPaneContainerOrientation === "horizontal") ||
				(this.type === "UR" && dir === "up" && splitPaneContainerOrientation === "horizontal") ||
				(this.type === "LL" && dir === "left" && splitPaneContainerOrientation === "vertical")
			) {
				splitablePane.removePrevious(container, splitPaneContainerOrientation);
			}
			else if (
				(this.type === "LR" && dir === "right" && splitPaneContainerOrientation === "vertical") ||
				(this.type === "LR" && dir === "down" && splitPaneContainerOrientation === "horizontal") ||
				(this.type === "LL" && dir === "down" && splitPaneContainerOrientation === "horizontal") ||
				(this.type === "UR" && dir === "right" && splitPaneContainerOrientation === "vertical")
			) {
				splitablePane.removeNext(container, splitPaneContainerOrientation);
			}
			SplitButton.checkContainerForSingle(container, splitablePane);
		}

		this.uiRoot.baseSplitPaneContainer.updateSizesRecursively();
	}
}

export class SplitButtonBuilder<T extends IOAPI> extends UIElementBuilder<T, SplitButton<T>> {
	protected _domClassName = "split-button";

	protected get _domClass() {
		return SplitButton;
	}

	public build(windowUIBuilder: WindowUIBuilder<T>, config: { domClassName: string, uiRoot: WrappingPane, type: SplitButtonType }) {
		const sb = windowUIBuilder.createElement<SplitButton<T>>(this._domClassName);
		sb.winUIBuilder = windowUIBuilder;
		sb.uiRoot = config.uiRoot;
		sb.type = config.type;
		sb.classList.add(config.type);
		sb.splitPaneDividerSize = splitPaneDividerSize;
		return sb;
	}

	protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<T>) {
		windowUIBuilder.addStyle(css);
	}
}


import { WrappingPane } from "../WrappingPane/WrappingPane";
import { SplitablePane } from "../SplitablePane/SplitablePane";
import { SplitPaneDivider } from "../SplitPaneDivider/SplitPaneDivider";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { UIElementBuilder } from "../../UIElementBuilder";
import { IOAPI } from "../../../IO-Interface/IOAPI";
import { SplitPaneContainer } from "../SplitPaneContainer/SplitPaneContainer";
import css from "./SplitButton.css?inline";

export class SplitButton<T extends IOAPI> extends HTMLElement {
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

export class SplitButtonBuilder<T extends IOAPI> extends UIElementBuilder<T, SplitButton<T>> {
	protected _domClassName = "split-button";

	protected get _domClass() {
		return SplitButton;
	}

	public build(windowUIBuilder: WindowUIBuilder<T>, config: { domClassName: string, uiRoot: WrappingPane }) {
		const sb = windowUIBuilder.createElement<SplitButton<T>>(this._domClassName);
		sb.winUIBuilder = windowUIBuilder;
		sb.uiRoot = config.uiRoot;
		return sb;
	}

	protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<T>) {
		windowUIBuilder.addStyle(css);
	}
}


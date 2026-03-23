import { IOAPI } from "../../../IO-Interface/IOAPI";
import { WindowUIBuilder } from "../../WindowUIBUilder";
import { UIElementBuilder } from "../../UIElementBuilder";
import { SplitButtonLL, SplitButtonLR, SplitButtonUL, SplitButtonUR } from "../SplitButton/SplitButton";
import { SplitPaneContainer } from "../SplitPaneContainer/SplitPaneContainer";
import { SplitPaneDivider } from "../SplitPaneDivider/SplitPaneDivider";
import { WrappingPane } from "../WrappingPane/WrappingPane";
import css from "./SplitablePane.css?inline";

export class SplitablePane<T extends IOAPI> extends HTMLElement {
	public cachedBase?: HTMLElement;
	public cachedWidth?: string;
	public cachedHeight?: string;
	public dummy!: HTMLDivElement;
	public _win!: Window;
	public uiRoot!: WrappingPane;
	public sbUL!: SplitButtonUL<T>;
	public sbUR!: SplitButtonUR<T>;
	public sbLL!: SplitButtonLL<T>;
	public sbLR!: SplitButtonLR<T>;

	private keyListener = (e: KeyboardEvent) => {
		if (e.ctrlKey && e.key === " " && !e.shiftKey) {
			this.toggleSingleWindow();
		}
	};

	private mouseEnterWindow = () => {
		this._win.addEventListener("keydown", this.keyListener);
	};

	private mouseLeaveWindow = () => {
		this._win.removeEventListener("keydown", this.keyListener);
	};

	protected connectedCallback() {
		this.addEventListener("mouseenter", this.mouseEnterWindow);
		this.addEventListener("mouseleave", this.mouseLeaveWindow);
	}

	protected disconnectedCallback() {
		this.removeEventListener("mouseenter", this.mouseEnterWindow);
		this.removeEventListener("mouseleave", this.mouseLeaveWindow);
	}

	public toggleSingleWindow() {
		if (this.cachedBase) {
			if (this.cachedHeight === undefined || this.cachedWidth === undefined) return;

			this.replaceWith(this.cachedBase);
			this.cachedBase = undefined;

			this.style.width = this.cachedWidth;
			this.style.height = this.cachedHeight;
			this.dummy.replaceWith(this);
			this.installSplitButtons();
		} else {
			this.cachedBase = this.uiRoot.baseSplitPaneContainer;
			this.replaceWith(this.dummy);
			this.cachedWidth = this.style.width;
			this.cachedHeight = this.style.height;
			this.style.width = "";
			this.style.height = "";
			this.uiRoot.baseSplitPaneContainer.replaceWith(this);
			this.uninstallSplitButtons();
		}
	}

	public installSplitButtons() {
		this.append(this.sbUL, this.sbUR, this.sbLL, this.sbLR);
	}

	public uninstallSplitButtons() {
		this.removeChild(this.sbUL);
		this.removeChild(this.sbUR);
		this.removeChild(this.sbLL);
		this.removeChild(this.sbLR);
	}

	public setContent(winUIBuilder: WindowUIBuilder<T>, config: { domClassName: string }) {
		this.innerHTML = "";
		const pane = winUIBuilder.build(config);
		if (!pane) {
			console.error(`Could not build ${JSON.stringify(config)}!`);
			return;
		}

		this.appendChild(pane);
		this.installSplitButtons();
	}

	public removePrevious(container: SplitPaneContainer, orientation: string) {
		let prev = this.previousElementSibling;
		if (prev)
			// split pane divider
			container.removeChild(prev);

		if ((prev = this.previousElementSibling) instanceof HTMLElement) {
			// next spitable pane or split pane container
			if (orientation == "verical")
				this.style.width =
					this.getBoundingClientRect().width +
					SplitPaneDivider.size +
					prev.getBoundingClientRect().width +
					"px";
			else
				this.style.height =
					this.getBoundingClientRect().height +
					SplitPaneDivider.size +
					prev.getBoundingClientRect().height +
					"px";
			container.removeChild(prev);
		}
	}

	public removeNext(container: SplitPaneContainer, orientation: string) {
		let next = this.nextElementSibling;
		if (next)
			// split pane divider
			container.removeChild(next);

		if ((next = this.nextElementSibling) instanceof HTMLElement) {
			// next spitable pane or split pane container
			if (orientation == "vertical")
				this.style.width =
					this.getBoundingClientRect().width +
					SplitPaneDivider.size +
					next.getBoundingClientRect().width +
					"px";
			else
				this.style.height =
					this.getBoundingClientRect().height +
					SplitPaneDivider.size +
					next.getBoundingClientRect().height +
					"px";
			container.removeChild(next);
		}
	}

	public static minSize = 32;

	public minHeight() {
		return SplitablePane.minSize;
	}

	public minWidth() {
		return SplitablePane.minSize;
	}
}

export class SplitablePaneBuilder<T extends IOAPI> extends UIElementBuilder<T, SplitablePane<T>> {
	protected _domClassName = "splitable-pane";

	protected get _domClass() {
		return SplitablePane;
	}

	public build(
		config:
			{
				domClassName: string,
				uiRoot: WrappingPane,
				paneDomClassName: string,
				orientation?: string,
				rect?: DOMRect
			}): SplitablePane<T> {
		const splitablePane = this.createElement<SplitablePane<T>>(this._domClassName);
		splitablePane.dummy = this.createElement<HTMLDivElement>("div");
		splitablePane._win = this.windowUIBuilder.window;
		splitablePane.uiRoot = config.uiRoot;

		const sbUL = this.windowUIBuilder.build<SplitButtonUL<T>>({ domClassName: "split-button-ul", uiRoot: config.uiRoot });
		if (!sbUL) {
			console.log("Could not create SplitButtonUL!")
			return splitablePane;
		}
		const sbUR = this.windowUIBuilder.build<SplitButtonUR<T>>({ domClassName: "split-button-ur", uiRoot: config.uiRoot });
		if (!sbUR) {
			console.log("Could not create SplitButtonUR!")
			return splitablePane;
		}
		const sbLL = this.windowUIBuilder.build<SplitButtonLL<T>>({ domClassName: "split-button-ll", uiRoot: config.uiRoot });
		if (!sbLL) {
			console.log("Could not create SplitButtonLL!")
			return splitablePane;
		}
		const sbLR = this.windowUIBuilder.build<SplitButtonLR<T>>({ domClassName: "split-button-lr", uiRoot: config.uiRoot });
		if (!sbLR) {
			console.log("Could not create SplitButtonLL!")
			return splitablePane;
		}
		splitablePane.sbUL = sbUL;
		splitablePane.sbUR = sbUR;
		splitablePane.sbLL = sbLL;
		splitablePane.sbLR = sbLR;

		splitablePane.setContent(this.windowUIBuilder, { domClassName: config.paneDomClassName });

		splitablePane.installSplitButtons();

		if (config.orientation && config.rect) {
			if (config.orientation == "vertical")
				splitablePane.style.width = Math.round((config.rect.width - SplitPaneDivider.size) / 2) + "px";
			else splitablePane.style.height = Math.round((config.rect.height - SplitPaneDivider.size) / 2) + "px";
		}

		return splitablePane;
	}

	protected _initWindowComponentStyles(): void {
		this.addStyle(css);
	}
}

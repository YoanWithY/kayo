import { PageContext } from "../../PageContext";
import { Project } from "../../project/Project";
import { PaneStripe } from "../panes/PaneStripe";
import { UIPaneElement } from "../ui";
import { WrappingPane } from "../Wrapping/WrappingPane";
import { SplitButton, SplitButtonLL, SplitButtonLR, SplitButtonUL, SplitButtonUR } from "./SplitButton";
import { SplitPaneContainer } from "./SplitPaneContainer";
import { SplitPaneDivider } from "./SplitPaneDivider";

export class SplitablePane extends HTMLElement {
	private cachedBase?: HTMLElement;
	private dummy: HTMLDivElement;
	private cachedWidth?: string;
	private cachedHeight?: string;
	project!: Project;
	uiRoot!: WrappingPane;
	sp_ul!: SplitButton;
	sp_ur!: SplitButton;
	sp_ll!: SplitButton;
	sp_lr!: SplitButton;
	constructor() {
		super();
		this.dummy = document.createElement("div");
		const keyListener = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.key === " " && !e.shiftKey) {
				this.toggleSingleWindow();
			}
		};
		this.addEventListener("mouseenter", () => {
			window.addEventListener("keydown", keyListener);
		});
		this.addEventListener("mouseleave", () => {
			window.removeEventListener("keydown", keyListener);
		});
	}

	public toggleSingleWindow() {
		if (this.cachedBase) {
			if (this.cachedHeight === undefined || this.cachedWidth === undefined)
				return;

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
		this.project.fullRerender();
	}

	installSplitButtons() {
		this.append(this.sp_ul, this.sp_ur, this.sp_ll, this.sp_lr);
	}

	uninstallSplitButtons() {
		this.removeChild(this.sp_ul);
		this.removeChild(this.sp_ur);
		this.removeChild(this.sp_ll);
		this.removeChild(this.sp_lr);
	}

	static createSplitablePane(win: Window, pageContext: PageContext, uiRoot: WrappingPane, paneElement: UIPaneElement, orientation?: string, rect?: DOMRect): SplitablePane {
		const newSplitablePane = win.document.createElement("splitable-pane") as SplitablePane;
		newSplitablePane.uiRoot = uiRoot;
		newSplitablePane.project = pageContext.project;

		newSplitablePane.sp_ul = SplitButtonUL.create(win, pageContext, uiRoot);
		newSplitablePane.sp_ur = SplitButtonUR.create(win, pageContext, uiRoot);
		newSplitablePane.sp_ll = SplitButtonLL.create(win, pageContext, uiRoot);
		newSplitablePane.sp_lr = SplitButtonLR.create(win, pageContext, uiRoot);

		newSplitablePane.recreateContetent(win, pageContext, paneElement);


		newSplitablePane.installSplitButtons();

		if (orientation && rect) {
			if (orientation == "vertical")
				newSplitablePane.style.width = Math.round((rect.width - SplitPaneDivider.size) / 2) + "px";
			else
				newSplitablePane.style.height = Math.round((rect.height - SplitPaneDivider.size) / 2) + "px";
		}

		return newSplitablePane as SplitablePane;
	}

	public recreateContetent(win: Window, pageContext: PageContext, paneElement: UIPaneElement) {
		this.innerHTML = "";
		const pane = paneElement.createUIElement(win, pageContext, {});
		const strip = PaneStripe.createPaneStripe(win, pageContext, paneElement.getName());
		this.appendChild(strip);
		this.appendChild(pane);
		this.installSplitButtons();
	}

	getPaneStripe() {
		return this.children[0];
	}

	getContentPane() {
		return this.children[1];
	}

	removePrevious(container: SplitPaneContainer, orientation: string) {
		let prev = this.previousElementSibling;
		if (prev) // split pane divider
			container.removeChild(prev);

		if ((prev = this.previousElementSibling) instanceof HTMLElement) { // next spitable pane or split pane container
			if (orientation == "verical")
				this.style.width = this.getBoundingClientRect().width + SplitPaneDivider.size + prev.getBoundingClientRect().width + "px";
			else
				this.style.height = this.getBoundingClientRect().height + SplitPaneDivider.size + prev.getBoundingClientRect().height + "px";
			container.removeChild(prev);
		}
	}


	removeNext(container: SplitPaneContainer, orientation: string) {
		let next = this.nextElementSibling;
		if (next) // split pane divider
			container.removeChild(next);

		if ((next = this.nextElementSibling) instanceof HTMLElement) { // next spitable pane or split pane container
			if (orientation == "vertical")
				this.style.width = this.getBoundingClientRect().width + SplitPaneDivider.size + next.getBoundingClientRect().width + "px";
			else
				this.style.height = this.getBoundingClientRect().height + SplitPaneDivider.size + next.getBoundingClientRect().height + "px";
			container.removeChild(next);
		}
	}

	minHeight() {
		return PaneStripe.size2;
	}

	minWidth() {
		return PaneStripe.size2;
	}
}
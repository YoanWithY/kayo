import { PaneStripe } from "../panes/PaneStripe";
import { SplitPaneContainer } from "./SplitPaneContainer";
import { SplitPaneDivider } from "./SplitPaneDivider";

export class SplitablePane extends HTMLElement {

	static createSplitablePane(paneConstructor: () => HTMLElement, orientation?: string, rect?: DOMRect): SplitablePane {
		const newSplitablePane = document.createElement("splitable-pane");
		const strip = PaneStripe.createPaneStripe();
		newSplitablePane.appendChild(strip);
		const pane = paneConstructor();
		newSplitablePane.appendChild(pane);

		newSplitablePane.append(
			document.createElement("split-button-ul"),
			document.createElement("split-button-ur"),
			document.createElement("split-button-ll"),
			document.createElement("split-button-lr"));

		if (orientation && rect) {
			if (orientation == "vertical")
				newSplitablePane.style.width = Math.round((rect.width - SplitPaneDivider.size) / 2) + "px";
			else
				newSplitablePane.style.height = Math.round((rect.height - SplitPaneDivider.size) / 2) + "px";
		}

		return newSplitablePane as SplitablePane;
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
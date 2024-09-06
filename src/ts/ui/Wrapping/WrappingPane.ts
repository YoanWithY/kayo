import { SplitPaneContainer } from "../splitpane/SplitPaneContainer";
import { Footer } from "./Footer";

export class WrappingPane extends HTMLElement {
	baseSplitPaneContainer!: SplitPaneContainer;
	header!: HTMLDivElement;
	footer!: Footer;
	static createWrappingPane(): WrappingPane {
		const p = document.createElement("wrapping-pane") as WrappingPane;
		p.baseSplitPaneContainer = SplitPaneContainer.createRoot();
		p.header = document.createElement("div");
		p.footer = Footer.createFooter();
		p.appendChild(p.header);
		p.appendChild(p.baseSplitPaneContainer);
		p.appendChild(p.footer);
		return p;
	}
}
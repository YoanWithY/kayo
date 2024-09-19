export class PaneStripe extends HTMLElement {
	static size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pane-stripe-hight").replace("px", ""));
	static size2 = this.size * 2;

	static createPaneStripe() {
		return document.createElement("pane-stripe");
	}
}
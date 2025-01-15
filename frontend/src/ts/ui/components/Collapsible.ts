import { PageContext } from "../../PageContext";
import { buildUIElement } from "../ui";
import Tooltip from "./Tooltip";

export default class Collapsible extends HTMLElement {
	public opend = false;
	public collapsibleButton!: CollapsibleButton;
	public collapsibleContentContainer!: CollapsibleContentContainer;

	public toggleCollaps() {
		this.opend = !this.opend;
		if (this.opend) {
			this.appendChild(this.collapsibleContentContainer);
		} else {
			this.removeChild(this.collapsibleContentContainer);
		}
	}

	public static createUIElement(win: Window, pageContext: PageContext, obj: any) {
		const p = win.document.createElement(this.getDomClass()) as Collapsible;

		p.collapsibleButton = CollapsibleButton.createCollapsibleButton(win);
		p.collapsibleButton.collapsible = p;
		p.collapsibleButton.textContent = obj.text;
		p.appendChild(p.collapsibleButton);

		p.collapsibleContentContainer = win.document.createElement(CollapsibleContentContainer.getDomClass()) as CollapsibleContentContainer;

		const content = obj.content;
		if (content !== undefined)
			p.collapsibleContentContainer.appendChild(buildUIElement(win, pageContext, obj.content))

		const tooltip = obj.tooltip;
		if (tooltip !== undefined) {
			Tooltip.register(Tooltip.createTooltip(tooltip), p.collapsibleButton);
		}
		return p;
	}

	public static getDomClass() {
		return "collapsible-element";
	}
}

export class CollapsibleButton extends HTMLElement {
	public collapsible!: Collapsible;
	constructor() {
		super();
		this.addEventListener("click", () => {
			this.collapsible.toggleCollaps();
			this.setAttribute("state", this.collapsible.opend ? "open" : "closed")
		});
	}

	public static createCollapsibleButton(win: Window) {
		const p = win.document.createElement(this.getDomClass()) as CollapsibleButton;
		p.setAttribute("state", "closed");
		return p;
	}

	public static getDomClass() {
		return "collapsible-button"
	}
}

export class CollapsibleContentContainer extends HTMLElement {

	public static getDomClass() {
		return "collapsible-content-container"
	}
}


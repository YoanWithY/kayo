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

	public static createCollapsible(name = "", tooltip?: HTMLElement) {
		const p = document.createElement("collapsible-element") as Collapsible;
		p.collapsibleButton = CollapsibleButton.createCollapsibleButton();
		p.collapsibleButton.collapsible = p;
		p.appendChild(p.collapsibleButton);

		p.collapsibleContentContainer = document.createElement("collapsible-content-container") as CollapsibleContentContainer;
		p.collapsibleButton.textContent = name;

		if (tooltip !== undefined) {
			Tooltip.register(Tooltip.createTooltip(tooltip), p.collapsibleButton);
		}
		return p;
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

	public static createCollapsibleButton() {
		const p = document.createElement("collapsible-button") as CollapsibleButton;
		p.setAttribute("state", "closed");
		return p;
	}
}

export class CollapsibleContentContainer extends HTMLElement { }


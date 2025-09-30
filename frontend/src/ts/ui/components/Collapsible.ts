import { Kayo } from "../../Kayo";
import { buildUIElement } from "../ui";
import Checkbox from "./Checkbox";
import Tooltip from "./Tooltip";

export default class Collapsible extends HTMLElement {
	public opend = true;
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

	public static createUIElement(win: Window, kayo: Kayo, obj: any, varMap?: { [key: string]: string }) {
		const p = win.document.createElement(this.getDomClass()) as Collapsible;

		p.collapsibleButton = CollapsibleButton.createCollapsibleButton(win, kayo, obj.checkbox, varMap);
		p.collapsibleButton.collapsible = p;
		const text = win.document.createElement("span");
		text.textContent = obj.text;
		p.collapsibleButton.appendChild(text);
		p.appendChild(p.collapsibleButton);

		p.collapsibleContentContainer = win.document.createElement(
			CollapsibleContentContainer.getDomClass(),
		) as CollapsibleContentContainer;

		const content = obj.content;
		if (content !== undefined)
			p.collapsibleContentContainer.appendChild(buildUIElement(win, kayo, obj.content, varMap));

		const tooltip = obj.tooltip;
		if (tooltip !== undefined) {
			Tooltip.register(win, tooltip, p.collapsibleButton, obj);
		}

		p.appendChild(p.collapsibleContentContainer);
		return p;
	}

	public static getDomClass() {
		return "collapsible-element";
	}
}

export class CollapsibleButton extends HTMLElement {
	public collapsible!: Collapsible;
	private _clickCallback = () => {
		this.collapsible.toggleCollaps();
		this.setAttribute("state", this.collapsible.opend ? "open" : "closed");
	};

	protected connectedCallback() {
		this.addEventListener("click", this._clickCallback);
	}

	protected disconnectedCallback() {
		this.removeEventListener("click", this._clickCallback);
	}

	public static createCollapsibleButton(win: Window, kayo: Kayo, checkbox: any, varMap?: { [key: string]: string }) {
		const p = win.document.createElement(this.getDomClass()) as CollapsibleButton;
		p.setAttribute("state", "open");
		if (checkbox !== undefined) {
			const c = Checkbox.createUIElement(win, kayo, checkbox, varMap);
			p.appendChild(c);
		}
		return p;
	}

	public static getDomClass() {
		return "collapsible-button";
	}
}

export class CollapsibleContentContainer extends HTMLElement {
	public static getDomClass() {
		return "collapsible-content-container";
	}
}

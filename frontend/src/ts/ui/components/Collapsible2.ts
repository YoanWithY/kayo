import { Kayo } from "../../Kayo";
import { buildUIElement } from "../ui";
import Collapsible, { CollapsibleButton, CollapsibleContentContainer } from "./Collapsible";
import Tooltip from "./Tooltip";

export class Collapsible2 extends Collapsible {
	public static createUIElement(win: Window, kayo: Kayo, obj: any, vairables?: any) {
		const p = win.document.createElement(this.getDomClass()) as Collapsible2;

		p.collapsibleButton = CollapsibleButton.createCollapsibleButton(win);
		p.collapsibleButton.collapsible = p;
		p.collapsibleButton.textContent = obj.text;
		p.appendChild(p.collapsibleButton);

		p.collapsibleContentContainer = win.document.createElement(
			CollapsibleContentContainer.getDomClass(),
		) as CollapsibleContentContainer;
		const content = obj.content;
		if (content !== undefined)
			p.collapsibleContentContainer.appendChild(buildUIElement(win, kayo, obj.content, vairables));

		const tooltip = obj.tooltip;
		if (tooltip !== undefined) {
			Tooltip.register(win, tooltip, p.collapsibleButton, obj);
		}

		p.appendChild(p.collapsibleContentContainer);
		return p;
	}

	public static getDomClass() {
		return "collapsible-element-2";
	}
}

import { Kayo } from "../../Kayo";
import { buildUIElement } from "../ui";

export default abstract class BasicPane extends HTMLElement {
	public kayo!: Kayo;
	public static createUIElement(win: Window, kayo: Kayo, obj: any, variables?: any): BasicPane {
		const p = win.document.createElement(obj.class) as BasicPane;
		p.kayo = kayo;

		const children = obj.children;
		if (children === undefined) return p;

		for (const child of children) p.appendChild(buildUIElement(win, kayo, child, variables));
		return p;
	}

	public static getDomClass() {
		return "basic-pane";
	}
}

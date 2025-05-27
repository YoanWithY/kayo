import { Kayo } from "../../Kayo";
import { buildUIElement } from "../ui";

export default abstract class BasicPane extends HTMLElement {
	public kayo!: Kayo;
	public static createUIElement(win: Window, kayo: Kayo, obj?: any): BasicPane {
		const p = win.document.createElement(obj.class) as BasicPane;
		p.kayo = kayo;
		if (obj === undefined) return p;

		const children = obj.children;
		if (children === undefined) return p;

		for (const child of children) p.appendChild(buildUIElement(win, kayo, child));
		return p;
	}

	public static getDomClass() {
		return "basic-pane";
	}
}

import { Kayo } from "../../Kayo";
import { buildUIElement } from "../ui";

export default class VBox extends HTMLElement {
	public static createUIElement(win: Window, kayo: Kayo, obj: any, argMap?: { [key: string]: string }) {
		const p = win.document.createElement(this.getDomClass());
		const children = obj.children;
		if (children === undefined) return p;
		for (const child of children) p.appendChild(buildUIElement(win, kayo, child, argMap));
		return p;
	}

	public static getDomClass() {
		return "v-box";
	}
}

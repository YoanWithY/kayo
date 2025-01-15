import { PageContext } from "../../PageContext";
import { buildUIElement } from "../ui";

export default class Grid2Col extends HTMLElement {
	static createUIElement(win: Window, pageContext: PageContext, obj: any) {
		const p = win.document.createElement(this.getDomClass());
		const children = obj.children;
		if (children === undefined)
			return p;
		for (const child of children)
			p.appendChild(buildUIElement(win, pageContext, child));
		return p;
	}

	public static getDomClass() {
		return "grid-2col";
	}
}
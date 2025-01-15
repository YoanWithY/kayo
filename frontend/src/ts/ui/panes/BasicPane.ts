import { PageContext } from "../../PageContext";
import { buildUIElement } from "../ui";

export default abstract class BasicPane extends HTMLElement {
	public pageContext!: PageContext;
	public static createUIElement(win: Window, pageContext: PageContext, obj?: any): BasicPane {
		const p = win.document.createElement(obj.class) as BasicPane;
		p.pageContext = pageContext;
		if (obj === undefined)
			return p;

		const children = obj.children;
		if (children === undefined)
			return p;

		for (const child of children)
			p.appendChild(buildUIElement(win, pageContext, child));
		return p;
	}

	public static getDomClass() {
		return "basic-pane";
	}
}
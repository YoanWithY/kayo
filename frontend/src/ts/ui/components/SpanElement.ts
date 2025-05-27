import { Kayo } from "../../Kayo";

export default class SpanElement {
	public static createUIElement(win: Window, _: Kayo, obj: any) {
		const p = win.document.createElement("span");
		p.textContent = obj.text;
		return p;
	}

	public static getDomClass() {
		return "span-element";
	}
}

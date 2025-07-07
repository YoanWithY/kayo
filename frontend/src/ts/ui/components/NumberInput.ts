import { Kayo } from "../../Kayo";

export class NumberInput extends HTMLElement {
	public static createUIElement(win: Window, _: Kayo, __: any) {
		const p = win.document.createElement(this.getDomClass());
		return p;
	}

	public static getDomClass() {
		return "number-input";
	}
}

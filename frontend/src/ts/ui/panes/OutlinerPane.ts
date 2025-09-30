import { Kayo } from "../../Kayo";

export default class OutlinerPane extends HTMLElement {
	public static createUIElement(win: Window, __: Kayo, _: any): OutlinerPane {
		return win.document.createElement(this.getDomClass());
	}

	public static getDomClass() {
		return "outliner-pane";
	}

	public static getName() {
		return "Outliner";
	}
}

export class OutlinerElement extends HTMLElement {}

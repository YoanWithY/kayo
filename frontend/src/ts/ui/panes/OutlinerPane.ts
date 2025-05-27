import { Kayo } from "../../Kayo";
import BasicPane from "./BasicPane";

export default class OutlinerPane extends BasicPane {
	public static createUIElement(win: Window, kayo: Kayo, obj: any): OutlinerPane {
		return super.createUIElement(win, kayo, obj);
	}

	public static getDomClass() {
		return "outliner-pane";
	}

	public static getName() {
		return "Outliner";
	}
}

export class OutlinerElement extends HTMLElement {}

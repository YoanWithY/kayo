import { Kayo } from "../../Kayo";
import BasicPane from "./BasicPane";

import outputPaneTemplate from "./OutputPaneTemplate.json";

export default class OutputPane extends BasicPane {
	public static createUIElement(win: Window, kayo: Kayo): OutputPane {
		return super.createUIElement(win, kayo, outputPaneTemplate);
	}

	public static getDomClass() {
		return "output-pane";
	}

	public static getName() {
		return "Output Pane";
	}
}

import { PageContext } from "../../PageContext";
import BasicPane from "./BasicPane";

import outputPaneTemplate from "./OutputPaneTemplate.json"

export default class OutputPane extends BasicPane {

	public static createUIElement(win: Window, pageContext: PageContext): OutputPane {
		return super.createUIElement(win, pageContext, outputPaneTemplate);
	}

	public static getDomClass() {
		return "output-pane"
	}

	public static getName() {
		return "Output Pane";
	}
}
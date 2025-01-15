import { PTPChatPane } from "../../collaborative/PTPChatPannel";
import { PageContext } from "../../PageContext";
import { UIElement } from "../ui";
import BasicPane from "./BasicPane";
import OutlinerPane from "./OutlinerPane";
import OutputPane from "./OutpuPane";
import RessourcePane from "./RessourcePane";
import { ViewportPane } from "./ViewportPane";


const panes: { [key: string]: UIElement } = {
	"3D Viewport": ViewportPane,
	"Ressources": RessourcePane,
	"Output": OutputPane,
	"Outliner": OutlinerPane,
	"PTP Chat": PTPChatPane,
}
export default class PaneSelectorPane extends BasicPane {

	public static createUIElement(win: Window, pageContext: PageContext, _: any): PaneSelectorPane {
		const p = super.createUIElement(win, pageContext, { class: this.getDomClass() });
		for (const key in panes) {
			const button = win.document.createElement("button")
			button.className = "selectorButton";
			button.textContent = key;
			button.onclick = () => {
				const parent = p.parentElement;
				if (!parent)
					return;
				parent.replaceChild(panes[key].createUIElement(win, pageContext, {}), p);
			}
			p.appendChild(button);
		}
		return p;

	}

	public static getDomClass() {
		return "pane-selector-pane";
	}
}
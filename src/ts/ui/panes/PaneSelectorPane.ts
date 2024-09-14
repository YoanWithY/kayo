import { Project } from "../../project/Project";
import OutlinerPane from "./OutlinerPane";
import OutputPane from "./OutputPane";
import RessourcePane from "./RessourcePane";
import { ViewportPane } from "./ViewportPane";

const panes: { [key: string]: (project: Project) => HTMLElement } = {
	"3D Viewport": ViewportPane.createViewportPane,
	"Ressources": RessourcePane.createRessourcePane,
	"Output": OutputPane.createOutputPane,
	"Outliner": OutlinerPane.createOutlinerPane,
}

export default class PaneSelectorPane extends HTMLElement {
	public static createPaneSelectorPane(project: Project): PaneSelectorPane {
		const p = document.createElement("pane-selector-pane") as PaneSelectorPane;

		for (const key in panes) {
			const button = document.createElement("button")
			button.className = "selectorButton";
			button.textContent = key;
			button.onclick = () => {
				const parent = p.parentElement;
				if (!parent)
					return;
				parent.replaceChild(panes[key](project), p);
			}
			p.appendChild(button);
		}
		return p;
	}
}
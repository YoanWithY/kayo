import { SplitPaneContainer } from "../splitpane/SplitPaneContainer";
import { Footer } from "./Footer";
import fullScreenOnIcon from "../../../svg/fullscreenOn.svg?raw";
import fullScreenOffIcon from "../../../svg/fullscreenOff.svg?raw";
import { IconedToggleButton } from "../components/IconedToggleButton";
import { Project } from "../../project/Project";

export class WrappingPane extends HTMLElement {
	project!: Project;
	baseSplitPaneContainer!: SplitPaneContainer;
	header!: HTMLDivElement;
	footer!: Footer;
	static createWrappingPane(project: Project): WrappingPane {
		const p = document.createElement("wrapping-pane") as WrappingPane;
		p.project = project;
		p.baseSplitPaneContainer = SplitPaneContainer.createRoot(project);
		p.header = document.createElement("div");

		const fullScreenButton = IconedToggleButton.createIconedToggleButton(
			fullScreenOffIcon,
			fullScreenOnIcon,
			() => {
				if (document.fullscreenElement)
					document.exitFullscreen();
			},
			() => document.documentElement.requestFullscreen()
		);

		document.addEventListener('fullscreenchange', () => {
			if (!document.fullscreenElement) {
				fullScreenButton.turnOff();
			}
		});

		p.header.appendChild(fullScreenButton);

		p.footer = Footer.createFooter();
		p.appendChild(p.header);
		p.appendChild(p.baseSplitPaneContainer);
		p.appendChild(p.footer);
		return p;
	}
}
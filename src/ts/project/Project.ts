import { SplitPaneContainer } from "../ui/splitpane/SplitPaneContainer";
import { ProjectConfig } from "./Config";
import { ProjectState } from "./State";
import Renderer from "../rendering/Renderer";

export let openProject: Project;
export class Project {

	config: ProjectConfig;
	state: ProjectState;
	renderer!: Renderer;
	uiRoot!: SplitPaneContainer;

	constructor() {
		this.config = new ProjectConfig();
		this.state = new ProjectState(this.config)
	}

	installUI() {
		if (openProject)
			openProject.uninstall();
		openProject = this;
		this.renderer = new Renderer();
		this.uiRoot = SplitPaneContainer.createRoot();
		document.body.appendChild(this.uiRoot);
		requestAnimationFrame(this.renderer.loop);
	}

	uninstall() {
		const wrapper = document.getElementById("wrapper")
		if (wrapper)
			document.body.removeChild(wrapper);
	}
}
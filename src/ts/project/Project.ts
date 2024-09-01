import { SplitPaneContainer } from "../ui/splitpane/SplitPaneContainer";
import { ProjectConfig } from "./Config";
import { ProjectState } from "./State";
import Renderer from "../rendering/Renderer";
import Scene from "./Scene";

export let openProject: Project;
export class Project {

	config: ProjectConfig;
	state: ProjectState;
	renderer!: Renderer;
	scene!: Scene;
	uiRoot!: SplitPaneContainer;

	constructor() {
		this.config = new ProjectConfig();
		this.state = new ProjectState(this.config);
	}

	open() {
		if (openProject)
			openProject.close();
		openProject = this;
		this.renderer = new Renderer();
		this.scene = new Scene();
		this.uiRoot = SplitPaneContainer.createRoot();
		document.body.appendChild(this.uiRoot);
		requestAnimationFrame(this.renderer.loop);
	}

	close() {
		const wrapper = document.getElementById("wrapper")
		if (wrapper)
			document.body.removeChild(wrapper);
	}
}
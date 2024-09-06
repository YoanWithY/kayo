import { ProjectConfig } from "./Config";
import { ProjectState } from "./State";
import Renderer from "../rendering/Renderer";
import Scene from "./Scene";
import { WrappingPane } from "../ui/Wrapping/WrappingPane";
import { ViewportPane } from "../ui/panes/ViewportPane";

export let openProject: Project;
export class Project {

	config: ProjectConfig;
	state: ProjectState;
	renderer!: Renderer;
	scene!: Scene;
	uiRoot!: WrappingPane;

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
		this.uiRoot = WrappingPane.createWrappingPane();
		document.body.appendChild(this.uiRoot);
	}

	close() {
		const wrapper = document.getElementById("wrapper")
		if (wrapper)
			document.body.removeChild(wrapper);
	}

	fullRerender() {
		for (const vp of ViewportPane.viewportPanes)
			this.renderer.requestAnimationFrameWith(vp);
	}
}
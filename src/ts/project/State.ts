import { OutputConfig, OutputDisplayConfig, ProjectConfig } from "./Config";
import StateVariable from "./StateVariable";

export class ProjectState {
	output: OutputState;

	constructor(config: ProjectConfig) {
		this.output = new OutputState(config.output);
	}
}

export class OutputState {
	display: OutputDisplayState;
	constructor(output: OutputConfig) {
		this.display = new OutputDisplayState(output.display);
	}
}

export class OutputDisplayState {
	swapChainColorSpace: StateVariable<PredefinedColorSpace>;
	constructor(display: OutputDisplayConfig) {
		this.swapChainColorSpace = new StateVariable(display.swapChainColorSpace);
	}
}

export class OutputRenderState {

}


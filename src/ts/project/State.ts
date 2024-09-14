import { MSAAOptions as MSAAOption, OutputConfig, OutputDeferredRenderConfig, OutputDisplayConfig, OutputForwardRenderConfig, OutputRenderConfig, ProjectConfig, RenderMode, SwapChainBitDepth } from "./Config";
import { Project } from "./Project";
import StateVariable from "./StateVariable";

export class ProjectState {
	project: Project;
	output: OutputState;

	constructor(project: Project, config: ProjectConfig) {
		this.project = project;
		this.output = new OutputState(project, config.output);
	}
}

export class OutputState {
	project: Project;
	render: OutputRenderState;
	display: OutputDisplayState;

	constructor(project: Project, output: OutputConfig) {
		this.project = project;
		this.display = new OutputDisplayState(project, output.display);
		this.render = OutputRenderState.create(project, output.render);
	}
}

export class OutputDisplayState {
	project: Project
	swapChainColorSpace: StateVariable<PredefinedColorSpace>;
	swapChainBitDepth: StateVariable<SwapChainBitDepth>;
	swapChainToneMappingMode: StateVariable<GPUCanvasToneMappingMode>;

	constructor(project: Project, display: OutputDisplayConfig) {
		this.project = project;
		this.swapChainColorSpace = new StateVariable(project, display.swapChainColorSpace);
		this.swapChainColorSpace.addChangeListener((value: PredefinedColorSpace) => {
			this.project.config.output.display.swapChainColorSpace = value;
			this.project.renderer.needsPipleineRebuild = true;
			this.project.renderer.needsContextReconfiguration = true;
		}, "deferred");
		this.swapChainColorSpace.addChangeListener(() => this.project.fullRerender(), "immediate");

		this.swapChainBitDepth = new StateVariable(project, display.swapChainBitDepth);
		this.swapChainBitDepth.addChangeListener((value: SwapChainBitDepth) => {
			this.project.config.output.display.swapChainBitDepth = value;
			this.project.renderer.needsContextReconfiguration = true;
			this.project.renderer.needsPipleineRebuild = true;
		}, "deferred");
		this.swapChainBitDepth.addChangeListener(() => this.project.fullRerender(), "immediate");


		this.swapChainToneMappingMode = new StateVariable(project, display.swapChainToneMappingMode);
		this.swapChainToneMappingMode.addChangeListener((value: GPUCanvasToneMappingMode) => {
			this.project.renderer.needsContextReconfiguration = true;
			this.project.config.output.display.swapChainToneMappingMode = value;
		}, "deferred");
		this.swapChainToneMappingMode.addChangeListener(() => this.project.fullRerender(), "immediate");
	}
}

export abstract class OutputRenderState {
	project: Project;
	abstract mode: StateVariable<RenderMode>;
	constructor(project: Project) {
		this.project = project;
	}
	static create(project: Project, renderConfig: OutputRenderConfig) {
		if (renderConfig.mode === "forward") {
			return new OutputForwardRenderState(project, renderConfig as OutputForwardRenderConfig);
		} else {
			return new OutputDeferredRenderState(project, renderConfig as OutputDeferredRenderConfig);
		}
	}
}

export class OutputForwardRenderState extends OutputRenderState {
	mode: StateVariable<RenderMode>;
	msaa: StateVariable<MSAAOption>;

	constructor(project: Project, forwardRenderConfig: OutputForwardRenderConfig) {
		super(project);
		this.mode = new StateVariable<RenderMode>(project, forwardRenderConfig.mode);

		this.msaa = new StateVariable<MSAAOption>(project, forwardRenderConfig.msaa);
		this.msaa.addChangeListener((value: MSAAOption) => {
			(this.project.config.output.render as OutputForwardRenderConfig).msaa = value;
			this.project.renderer.needsPipleineRebuild = true;
		}, "deferred");
		this.msaa.addChangeListener(() => this.project.fullRerender(), "immediate");
	}
}

export class OutputDeferredRenderState extends OutputRenderState {
	mode: StateVariable<RenderMode>;
	constructor(project: Project, deferredRenderConfig: OutputDeferredRenderConfig) {
		super(project);
		this.mode = new StateVariable<RenderMode>(project, deferredRenderConfig.mode);
	}
}
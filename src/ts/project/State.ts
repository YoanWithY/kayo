import { OutputConfig, OutputDeferredRenderConfig, OutputDisplayConfig, OutputForwardRenderConfig, OutputRenderConfig, ProjectConfig, RenderMode, SwapChainBitDepth } from "./Config";
import { openProject } from "./Project";
import StateVariable from "./StateVariable";

export class ProjectState {
	output: OutputState;

	constructor(config: ProjectConfig) {
		this.output = new OutputState(config.output);
	}
}

export class OutputState {
	display: OutputDisplayState;
	render: OutputRenderConfig;

	constructor(output: OutputConfig) {
		this.display = new OutputDisplayState(output.display);
		this.render = OutputRenderState.create(output.render);
	}
}

export class OutputDisplayState {
	swapChainColorSpace: StateVariable<PredefinedColorSpace>;
	swapChainBitDepth: StateVariable<SwapChainBitDepth>;
	swapChainToneMappingMode: StateVariable<GPUCanvasToneMappingMode>;

	constructor(display: OutputDisplayConfig) {
		this.swapChainColorSpace = new StateVariable(display.swapChainColorSpace);
		this.swapChainColorSpace.addChangeListener((value: PredefinedColorSpace) => {
			openProject.config.output.display.swapChainColorSpace = value;
			openProject.renderer.needsPipleineRebuild = true;
			openProject.renderer.needsContextReconfiguration = true;
		}, "deferred");
		this.swapChainColorSpace.addChangeListener(() => openProject.fullRerender(), "immediate");

		this.swapChainBitDepth = new StateVariable(display.swapChainBitDepth);
		this.swapChainBitDepth.addChangeListener((value: SwapChainBitDepth) => {
			openProject.config.output.display.swapChainBitDepth = value;
			openProject.renderer.needsContextReconfiguration = true;
			openProject.renderer.needsPipleineRebuild = true;
		}, "deferred");
		this.swapChainBitDepth.addChangeListener(() => openProject.fullRerender(), "immediate");


		this.swapChainToneMappingMode = new StateVariable(display.swapChainToneMappingMode);
		this.swapChainToneMappingMode.addChangeListener((value: GPUCanvasToneMappingMode) => {
			openProject.renderer.needsContextReconfiguration = true;
			openProject.config.output.display.swapChainToneMappingMode = value;
		}, "deferred");
		this.swapChainToneMappingMode.addChangeListener(() => openProject.fullRerender(), "immediate");
	}
}

export abstract class OutputRenderState {
	abstract mode: RenderMode;
	static create(renderConfig: OutputRenderConfig) {
		if (renderConfig.mode === "forward") {
			return new OutputForwardRenderState(renderConfig as OutputForwardRenderConfig);
		} else {
			return new OutputDeferredRenderState(renderConfig as OutputDeferredRenderConfig);
		}
	}
}

export class OutputForwardRenderState extends OutputRenderState {
	mode: RenderMode;

	constructor(forwardRenderConfig: OutputForwardRenderConfig) {
		super();
		this.mode = forwardRenderConfig.mode;
	}
}

export class OutputDeferredRenderState extends OutputRenderState {
	mode: RenderMode;
	constructor(deferredRenderConfig: OutputDeferredRenderConfig) {
		super();
		this.mode = deferredRenderConfig.mode;
	}
}


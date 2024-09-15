export type SwapChainBitDepth = "8bpc" | "16bpc";
export type RenderMode = "forward" | "deferred";
export type MSAAOptions = 1 | 4;

export class ProjectConfig {
	output = new OutputConfig();
}

export class OutputConfig {
	display: OutputDisplayConfig = new OutputDisplayConfig();
	render: OutputRenderConfig = new OutputForwardRenderConfig();
}

export class OutputDisplayConfig {
	swapChainColorSpace: PredefinedColorSpace = "srgb";
	swapChainBitDepth: SwapChainBitDepth = "8bpc";
	swapChainToneMappingMode: GPUCanvasToneMappingMode = "standard";
}

export class OverlayRenderConfig {
	enabled = true;
	selection = true;
	grid = true;
}

export abstract class OutputRenderConfig {
	abstract mode: RenderMode;
	overlay: OverlayRenderConfig = new OverlayRenderConfig();
}

export class OutputForwardRenderConfig extends OutputRenderConfig {
	mode: "forward" = "forward";
	msaa: MSAAOptions = 4;
}

export class OutputDeferredRenderConfig extends OutputRenderConfig {
	mode: "deferred" = "deferred";
}


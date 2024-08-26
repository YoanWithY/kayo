import { gpu } from "./gpuInit";

export type SwapChainFormat = "rgba16float" | "bgra8unorm" | "rgba8unorm";

export class ProjectConfig {
	outputConfig: OutputConfig = new OutputConfig();
}

export class OutputConfig {
	public swapChainFormat: SwapChainFormat = gpu.getPreferredCanvasFormat() as SwapChainFormat;
	public swapChainColorSpace: PredefinedColorSpace = "srgb";
	public swapChainToneMappingMode: GPUCanvasToneMappingMode = "standard";
}

export const projectConfig = new ProjectConfig();
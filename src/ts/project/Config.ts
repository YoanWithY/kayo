import { gpu } from "../GPUX";

export type SwapChainBitDepth = "8bpc" | "16bpc";

export class ProjectConfig {
	output = new OutputConfig();
}

export class OutputConfig {
	display = new OutputDisplayConfig();
}

export class OutputDisplayConfig {
	swapChainColorSpace: PredefinedColorSpace = "srgb";
	swapChainBitDepth: SwapChainBitDepth = "8bpc";
	swapChainToneMappingMode: GPUCanvasToneMappingMode = "standard";
}

export function bitDepthToSwapChainFormat(bpc: SwapChainBitDepth): GPUTextureFormat {
	if (bpc === "8bpc")
		return gpu.getPreferredCanvasFormat();
	return "rgba16float";
}
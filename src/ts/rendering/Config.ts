import { gpu } from "./gpuInit";

export type SwapChainFormat = "rgba16float" | "bgra8unorm" | "rgba8unorm";

export default class {
	public static swapChainFormat: SwapChainFormat = gpu.getPreferredCanvasFormat() as SwapChainFormat;
	public static swapChainColorSpace: PredefinedColorSpace = "srgb";
	public static swapChainToneMappingMode: GPUCanvasToneMappingMode = "standard";
}
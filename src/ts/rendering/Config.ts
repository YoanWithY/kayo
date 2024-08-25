export default class {
	public static swapChainFormat: GPUTextureFormat & ("rgba16float" | "bgra8unorm" | "rgba8unorm") = "rgba16float";
	public static swapChainColorSpace: PredefinedColorSpace = "display-p3";
	public static swapChainToneMappingMode: GPUCanvasToneMappingMode = "extended";
}
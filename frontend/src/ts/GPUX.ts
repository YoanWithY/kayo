export type GPUX = {
	gpu: GPU;
	gpuAdapter: GPUAdapter;
	gpuDevice: GPUDevice;
};

let initialied = false;
export async function gpuInit(): Promise<string | GPUX> {
	if (initialied) return "WebGPU is already initialized!";

	const gpu = window.navigator.gpu;
	if (!gpu) return "WebGPU is not supported!";

	const adapterOptions: GPURequestAdapterOptions = {
		// powerPreference: "high-performance",
		forceFallbackAdapter: false,
		// featureLevel: "core",
	};
	const gpuAdapter = await gpu.requestAdapter(adapterOptions);

	if (!gpuAdapter) return "Could not request GPU adapter!";

	const devicei: GPUDeviceDescriptor = {
		label: "Main GPU Device",
		requiredFeatures: ["timestamp-query"],
		defaultQueue: { label: "Default Queue" },
		requiredLimits: { maxTextureArrayLayers: gpuAdapter.limits.maxTextureArrayLayers },
	};
	const gpuDevice = await gpuAdapter.requestDevice(devicei);
	if (!gpuDevice) return "Could not request GPU device!";

	initialied = true;
	return { gpu, gpuAdapter, gpuDevice };
}

export class GPUX {
	private readonly _gpu: GPU;
	private readonly _gpuAdapter: GPUAdapter;
	private readonly _gpuDevice: GPUDevice;
	private constructor(gpu: GPU, gpuAdapter: GPUAdapter, gpuDevice: GPUDevice) {
		this._gpu = gpu;
		this._gpuAdapter = gpuAdapter;
		this._gpuDevice = gpuDevice;
	}

	public get gpu() {
		return this._gpu;
	}

	public get gpuAdapter() {
		return this._gpuAdapter;
	}

	public get gpuDevice() {
		return this._gpuDevice;
	}

	public getSwapChainFormat(bitDepth: number): GPUTextureFormat {
		if (bitDepth === 8) return this.gpu.getPreferredCanvasFormat();
		return "rgba16float";
	}

	private static initialied = false;
	public static async requestGPUX(): Promise<string | GPUX> {
		if (this.initialied) return "WebGPU is already initialized!";

		const gpu = window.navigator.gpu;
		if (!gpu) return "WebGPU is not supported!";

		const adapterOptions: GPURequestAdapterOptions = {
			powerPreference: "high-performance",
			forceFallbackAdapter: false,
			featureLevel: "core",
		};
		const gpuAdapter = await gpu.requestAdapter(adapterOptions);

		if (!gpuAdapter) return "Could not request GPU adapter!";

		const devicei: GPUDeviceDescriptor = {
			label: "Kayo GPU Device",
			requiredFeatures: ["timestamp-query"],
			defaultQueue: { label: "Kayo default Queue" },
			requiredLimits: { maxTextureArrayLayers: gpuAdapter.limits.maxTextureArrayLayers },
		};
		const gpuDevice = await gpuAdapter.requestDevice(devicei);
		if (!gpuDevice) return "Could not request GPU device!";

		this.initialied = true;
		return new GPUX(gpu, gpuAdapter, gpuDevice);
	}
}

export function getElement<T>(iterable: Iterable<T>, index: number): T | undefined {
	let i = 0;
	for (const val of iterable) {
		if (i === index) return val;
		i++;
	}
	return undefined;
}

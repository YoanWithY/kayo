export const gpu = window.navigator.gpu;
if (!gpu) {
    alert("WebGPU not supported.");
    throw new Error("WebGPU not supported.");
}

export const gpuAdapter: GPUAdapter = await gpu.requestAdapter({ powerPreference: undefined }) as GPUAdapter;
if (!gpuAdapter) {
    alert("Could not create GPU adapter.");
    throw new Error("Could not get GPU adapter.");
}

export const gpuDevice = await gpuAdapter.requestDevice({
    requiredFeatures: [
        "timestamp-query"
    ]
});

export function gpuInit() {
    return { gpu, gpuAdapter, gpuDevice };
}
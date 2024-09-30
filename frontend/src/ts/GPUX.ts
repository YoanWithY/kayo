export const gpu = window.navigator.gpu;
if (!gpu) {
    alert("WebGPU not supported.");
    throw new Error("WebGPU not supported.");
}

export const gpuAdapter: GPUAdapter = await gpu.requestAdapter({ powerPreference: "high-performance" }) as GPUAdapter;
if (!gpuAdapter) {
    alert("Could not create GPU adapter.");
    throw new Error("Could not create GPU adapter.");
}

export const gpuDevice = await gpuAdapter.requestDevice({
    label: "Main GPU Device",
    requiredFeatures: [
        "timestamp-query"
    ],
    defaultQueue: { label: "Main Queue" },
    requiredLimits: { maxTextureArrayLayers: gpuAdapter.limits.maxTextureArrayLayers }
});

if (!gpuDevice) {
    alert("Could not create GPU Device.");
    throw new Error("Could not create GPU Device.");
}

export function gpuInit() {
    return { gpu, gpuAdapter, gpuDevice };
}
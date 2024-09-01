export const gpu = window.navigator.gpu;
if (!gpu) {
    throw new Error("WebGPU not supported.");
}

export const gpuAdapter: GPUAdapter = await gpu.requestAdapter({ powerPreference: undefined }) as GPUAdapter;
if (!gpuAdapter) {
    throw new Error("Could not get GPU adapter.");
}

export const gpuDevice = await gpuAdapter.requestDevice();

export const gpuCanvas = document.getElementById("gpuCanvas") as HTMLCanvasElement;
if (gpuCanvas === null || !(gpuCanvas instanceof HTMLCanvasElement)) {
    throw new Error("No Canvas!");
}

export const gpuContext = gpuCanvas.getContext("webgpu") as GPUCanvasContext;

if (!gpuContext) {
    throw new Error("No GPU context.");
}

function handleResize(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
        if (entry.target === gpuCanvas) {
            const devicePixelSize = entry.devicePixelContentBoxSize[0];
            gpuCanvas.width = devicePixelSize.inlineSize;
            gpuCanvas.height = devicePixelSize.blockSize;
        }
    }
}

const resizeObserver = new ResizeObserver(handleResize);
resizeObserver.observe(gpuCanvas);

export function gpuInit() {
    return { gpu, gpuAdapter, gpuCanvas, gpuContext };
}
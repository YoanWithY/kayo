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

function setupCanvas() {
    let dpr = window.devicePixelRatio || 1;
    let width = gpuCanvas.clientWidth;
    let height = gpuCanvas.clientHeight;
    if (gpuCanvas.width != width || gpuCanvas.height != height) {
        gpuCanvas.width = width * dpr;
        gpuCanvas.height = height * dpr;
    }
}

window.addEventListener('resize', setupCanvas);
setupCanvas();

export function gpuInit() {
    return { gpu, gpuAdapter, gpuCanvas, gpuContext };
}
import { OutputConfig, projectConfig } from "./Config";
import { gpuDevice } from "./gpuInit";

export let gpuCanvas: HTMLCanvasElement;

gpuCanvas = document.getElementById("gpuCanvas") as HTMLCanvasElement;
if (gpuCanvas === null || !(gpuCanvas instanceof HTMLCanvasElement))
	throw new Error("No Canvas!");

export const gpuContext = gpuCanvas.getContext("webgpu") as GPUCanvasContext;
if (!gpuContext)
	throw new Error("No GPU context.");

export function configureCanvas(outputConfig: OutputConfig) {
	gpuContext.unconfigure();
	gpuContext.configure({
		device: gpuDevice,
		format: outputConfig.swapChainFormat,
		alphaMode: "opaque",
		colorSpace: outputConfig.swapChainColorSpace,
		toneMapping: { mode: outputConfig.swapChainToneMappingMode },
		usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
	});
}

configureCanvas(projectConfig.outputConfig);

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
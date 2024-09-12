import { gpu, gpuDevice } from "../GPUX";
import { SwapChainBitDepth } from "../project/Config";
import { openProject } from "../project/Project";
import { getElement } from "./RenderUtil";
import { Viewport } from "./Viewport";

export class ViewportCache {
	public viewport;
	prevWidth = -1;
	prevHeight = -1;
	depthTexture?: GPUTexture;
	querySet: GPUQuerySet;
	timeStempBufferResolve: GPUBuffer;
	timeStempMapBuffer: GPUBuffer;
	constructor(viewport: Viewport) {
		this.viewport = viewport;

		this.querySet = gpuDevice.createQuerySet({
			label: `time stamp query set for ${viewport.lable}`,
			type: 'timestamp',
			count: 2,
		});
		this.timeStempBufferResolve = gpuDevice.createBuffer({
			label: `time stemp querey resolve buffer for ${viewport.lable}`,
			size: this.querySet.count * 8,
			usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.QUERY_RESOLVE,
		});

		this.timeStempMapBuffer = gpuDevice.createBuffer({
			label: `time stemp map buffer for ${viewport.lable}`,
			size: this.timeStempBufferResolve.size,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
		});
		this.reconfigureContext();
	}

	public conditionFrambebufferUpdate() {
		const w = this.viewport.getCurrentTexture().width;
		const h = this.viewport.getCurrentTexture().height;
		if (w === this.prevWidth && h === this.prevHeight)
			return;

		if (this.depthTexture)
			this.depthTexture.destroy();

		this.depthTexture = gpuDevice.createTexture({
			size: [w, h, 1],
			format: 'depth24plus',
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			label: "Render Depth Attachment",
		});

		this.prevWidth = w;
		this.prevHeight = h;
	}

	public reconfigureContext() {
		const context = this.viewport.canvasContext;
		if (!context)
			return;
		const displayConfig = openProject.config.output.display;
		context.unconfigure();
		context.configure({
			device: gpuDevice,
			format: bitDepthToSwapChainFormat(displayConfig.swapChainBitDepth),
			colorSpace: displayConfig.swapChainColorSpace,
			toneMapping: { mode: displayConfig.swapChainToneMappingMode },
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			alphaMode: "opaque",
		});
	}

	public setupRenderPass(renderPassDescriptor: GPURenderPassDescriptor) {
		const colorAttachment = getElement(renderPassDescriptor.colorAttachments, 0);
		if (!colorAttachment) {
			console.error("Could not find color attachment.");
			return;
		}
		colorAttachment.view = this.viewport.getCurrentTexture().createView();
		this.conditionFrambebufferUpdate();
		const depthAttachment = renderPassDescriptor.depthStencilAttachment;
		if (depthAttachment && this.depthTexture) {
			depthAttachment.view = this.depthTexture.createView();
		}

		const timestampWrites = renderPassDescriptor.timestampWrites;
		if (timestampWrites) {
			timestampWrites.querySet = this.querySet;
		}
	}

	public resolvePerformanceQueryCommand(commandEncoder: GPUCommandEncoder) {
		commandEncoder.resolveQuerySet(this.querySet, 0, this.querySet.count, this.timeStempBufferResolve, 0);
		if (this.timeStempMapBuffer.mapState === "unmapped") {
			commandEncoder.copyBufferToBuffer(
				this.timeStempBufferResolve, 0,
				this.timeStempMapBuffer, 0,
				this.timeStempBufferResolve.size);
		}
	}

	public asyncGPUPerformanceUpdate() {
		if (this.timeStempMapBuffer.mapState === "unmapped") {
			this.timeStempMapBuffer.mapAsync(GPUMapMode.READ).then(() => {
				const times = new BigInt64Array(this.timeStempMapBuffer.getMappedRange());
				const gpuTime = Number(times[1] - times[0]);
				this.timeStempMapBuffer.unmap();
				this.viewport.setGPUTime(gpuTime);
			});
		}
	}

	public destroy() {

	}
}

export function bitDepthToSwapChainFormat(bpc: SwapChainBitDepth): GPUTextureFormat {
	if (bpc === "8bpc")
		return gpu.getPreferredCanvasFormat();
	return "rgba16float";
}
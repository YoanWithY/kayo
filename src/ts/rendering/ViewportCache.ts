import { gpuDevice } from "../GPUX";
import { MSAAOptions } from "../project/Config";
import { Project } from "../project/Project";
import { getElement } from "./RenderUtil";
import { Viewport } from "./Viewport";

export class ViewportCache {
	public viewport;
	prevWidth = -1;
	prevHeight = -1;
	prevMSAA = -1;
	prevTargetFormat: GPUTextureFormat = "stencil8";
	depthTexture?: GPUTexture;
	colorTexture?: GPUTexture;
	querySet: GPUQuerySet;
	timeStempBufferResolve: GPUBuffer;
	timeStempMapBuffer: GPUBuffer;
	project: Project;
	constructor(project: Project, viewport: Viewport) {
		this.project = project;
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

	public conditionFrambebufferUpdate(msaa: MSAAOptions) {
		const w = this.viewport.getCurrentTexture().width;
		const h = this.viewport.getCurrentTexture().height;
		this.conditionColorAttachmentUpdate(w, h, msaa);
		if (w === this.prevWidth && h === this.prevHeight && msaa === this.prevMSAA)
			return;

		if (this.depthTexture)
			this.depthTexture.destroy();

		this.depthTexture = gpuDevice.createTexture({
			size: [w, h, 1],
			format: 'depth24plus',
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			label: "Render Depth Attachment",
			sampleCount: msaa
		});

		this.prevWidth = w;
		this.prevHeight = h;
		this.prevMSAA = msaa;
	}

	private conditionColorAttachmentUpdate(w: number, h: number, msaa: MSAAOptions) {
		const currentFormat = this.project.bitDepthToSwapChainFormat();
		if (w === this.prevWidth && h === this.prevHeight && msaa === this.prevMSAA && currentFormat === this.prevTargetFormat)
			return;

		if (msaa === 1) { // No MSAA
			if (this.colorTexture) {
				this.colorTexture.destroy();
				this.colorTexture = undefined;
			}
			return;
		}

		if (this.colorTexture)
			this.colorTexture.destroy();

		this.colorTexture = gpuDevice.createTexture({
			size: [w, h, 1],
			format: currentFormat,
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			label: "Render Color Attachment",
			sampleCount: msaa
		});
	}

	public reconfigureContext() {
		const context = this.viewport.canvasContext;
		if (!context)
			return;
		const displayConfig = this.project.config.output.display;
		context.unconfigure();
		context.configure({
			device: gpuDevice,
			format: this.project.bitDepthToSwapChainFormat(),
			colorSpace: displayConfig.swapChainColorSpace,
			toneMapping: { mode: displayConfig.swapChainToneMappingMode },
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			alphaMode: "opaque",
		});
	}

	public setupRenderPass(renderPassDescriptor: GPURenderPassDescriptor, msaa: MSAAOptions) {
		const colorAttachment = getElement(renderPassDescriptor.colorAttachments, 0);
		if (!colorAttachment) {
			console.error("Could not find color attachment.");
			return;
		}

		this.conditionFrambebufferUpdate(msaa);

		if (msaa === 1) {
			colorAttachment.view = this.viewport.getCurrentTexture().createView();
			colorAttachment.resolveTarget = undefined;
		} else {
			if (this.colorTexture) {
				colorAttachment.view = this.colorTexture.createView();
				colorAttachment.resolveTarget = this.viewport.getCurrentTexture().createView();
			} else {
				console.error("Color attachment does not exist but is needed for MSAA.");
				return;
			}
		}

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
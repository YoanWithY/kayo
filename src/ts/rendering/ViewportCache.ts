import { gpuDevice } from "../GPUX";
import { MSAAOptions, OutputForwardRenderConfig } from "../project/Config";
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
	colorTextureMS?: GPUTexture;
	selectionTextureMS?: GPUTexture;
	selectionTextureSS?: GPUTexture;
	overlayTextureMS?: GPUTexture;
	overlayTextureSS?: GPUTexture;
	querySet: GPUQuerySet;
	timeStempBufferResolve: GPUBuffer;
	timeStempMapBuffer: GPUBuffer;
	compositingBindGroup0!: GPUBindGroup;
	project: Project;
	constructor(project: Project, viewport: Viewport) {
		this.project = project;
		this.viewport = viewport;

		this.querySet = gpuDevice.createQuerySet({
			label: `time stamp query set for ${viewport.lable}`,
			type: 'timestamp',
			count: 6,
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

	public conditionFrambebufferUpdate(config: OutputForwardRenderConfig) {
		const w = this.viewport.getCurrentTexture().width;
		const h = this.viewport.getCurrentTexture().height;
		this.conditionalColorAttachmentUpdate(w, h, config.msaa);
		this.conditionalOverlayAttachmentUpdate(w, h, config);
		if (w === this.prevWidth && h === this.prevHeight && config.msaa === this.prevMSAA)
			return;

		if (this.depthTexture)
			this.depthTexture.destroy();

		this.depthTexture = gpuDevice.createTexture({
			size: [w, h, 1],
			format: 'depth24plus',
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			label: "Render Depth Attachment",
			sampleCount: config.msaa
		});

		if (this.selectionTextureSS)
			this.selectionTextureSS.destroy();

		this.selectionTextureSS = gpuDevice.createTexture({
			label: "Selection Attachment",
			size: [w, h, 1],
			format: "rg8unorm",
			sampleCount: 1,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
		});

		if (this.selectionTextureMS) {
			this.selectionTextureMS.destroy();
			this.selectionTextureMS = undefined;
		}

		if (config.msaa > 1) {
			this.selectionTextureMS = gpuDevice.createTexture({
				label: "Selection Attachment",
				size: [w, h, 1],
				format: "rg8unorm",
				sampleCount: config.msaa,
				usage: GPUTextureUsage.RENDER_ATTACHMENT
			});
		}

		if (!this.overlayTextureSS || !this.selectionTextureSS) {
			console.error("Texture missing");
			return;
		}
		this.compositingBindGroup0 = gpuDevice.createBindGroup({
			label: "compositing bind group 0",
			entries: [
				{ binding: 0, resource: this.overlayTextureSS.createView() },
				{ binding: 1, resource: this.selectionTextureSS.createView() },
			],
			layout: this.project.renderer.compositingBindGroupLayout,
		});

		this.prevWidth = w;
		this.prevHeight = h;
		this.prevMSAA = config.msaa;
	}

	private conditionalColorAttachmentUpdate(w: number, h: number, msaa: MSAAOptions) {
		const currentFormat = this.project.getSwapChainFormat();
		if (w === this.prevWidth && h === this.prevHeight && msaa === this.prevMSAA && currentFormat === this.prevTargetFormat)
			return;

		if (msaa === 1) { // No MSAA
			if (this.colorTextureMS) {
				this.colorTextureMS.destroy();
				this.colorTextureMS = undefined;
			}
			return;
		}
		// Use MSAA
		if (this.colorTextureMS)
			this.colorTextureMS.destroy();

		this.colorTextureMS = gpuDevice.createTexture({
			size: [w, h, 1],
			format: currentFormat,
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			label: "Render Color Attachment",
			sampleCount: msaa
		});
	}

	private conditionalOverlayAttachmentUpdate(w: number, h: number, config: OutputForwardRenderConfig) {
		// Don't use overlay
		if (!config.overlay.enabled) {
			if (this.overlayTextureMS) {
				this.overlayTextureMS.destroy();
				this.overlayTextureMS = undefined;
			}
			if (this.overlayTextureSS) {
				this.overlayTextureSS.destroy();
				this.overlayTextureSS = undefined;
			}
			return
		}
		// Use overlay
		if (w === this.prevWidth && h === this.prevHeight && this.overlayTextureSS && (config.msaa === 1 || this.overlayTextureMS))
			return;

		if (this.overlayTextureSS)
			this.overlayTextureSS.destroy();

		this.overlayTextureSS = gpuDevice.createTexture({
			label: "Overlay Attachment",
			size: [w, h, 1],
			format: "rgba8unorm",
			sampleCount: 1,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
		});

		if (this.overlayTextureMS) {
			this.overlayTextureMS.destroy();
			this.overlayTextureMS = undefined;
		}

		if (config.msaa > 1) {
			this.overlayTextureMS = gpuDevice.createTexture({
				label: "Overlay resolve target",
				size: [w, h, 1],
				format: "rgba8unorm",
				sampleCount: config.msaa,
				usage: GPUTextureUsage.RENDER_ATTACHMENT
			});
		}
	}

	public reconfigureContext() {
		const context = this.viewport.canvasContext;
		if (!context)
			return;
		const displayConfig = this.project.config.output.display;
		context.unconfigure();
		context.configure({
			device: gpuDevice,
			format: this.project.getSwapChainFormat(),
			colorSpace: displayConfig.swapChainColorSpace,
			toneMapping: { mode: displayConfig.swapChainToneMappingMode },
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			alphaMode: "opaque",
		});
	}

	public setupRenderPasses(
		r3renderPassDescriptor: GPURenderPassDescriptor,
		overlayRenderPassDescriptor: GPURenderPassDescriptor,
		compositingRenderPassDescriptor: GPURenderPassDescriptor,
		config: OutputForwardRenderConfig) {
		const colorAttachment = getElement(r3renderPassDescriptor.colorAttachments, 0);
		const selectionAttachment = getElement(r3renderPassDescriptor.colorAttachments, 1);
		const overlayColorAttachment = getElement(overlayRenderPassDescriptor.colorAttachments, 0);
		const compositingAttachment = getElement(compositingRenderPassDescriptor.colorAttachments, 0);
		if (!colorAttachment || !selectionAttachment || !overlayColorAttachment || !compositingAttachment) {
			console.error("Could not find attachment.");
			return;
		}

		this.conditionFrambebufferUpdate(config);

		compositingAttachment.view = this.viewport.getCurrentTexture().createView();

		if (!this.selectionTextureSS || !this.overlayTextureSS) {
			console.error("Single sample texture attachment missing.");
			return;
		}

		if (config.msaa === 1) {
			colorAttachment.view = this.viewport.getCurrentTexture().createView();
			colorAttachment.resolveTarget = undefined;

			selectionAttachment.view = this.selectionTextureSS?.createView();
			selectionAttachment.resolveTarget = undefined;

			overlayColorAttachment.view = this.overlayTextureSS.createView();
			overlayColorAttachment.resolveTarget = undefined;
		} else {
			if (this.colorTextureMS && this.selectionTextureMS && this.overlayTextureMS) {
				colorAttachment.view = this.colorTextureMS.createView();
				colorAttachment.resolveTarget = this.viewport.getCurrentTexture().createView();

				selectionAttachment.view = this.selectionTextureMS.createView();
				selectionAttachment.resolveTarget = this.selectionTextureSS.createView();

				overlayColorAttachment.view = this.overlayTextureMS.createView();
				overlayColorAttachment.resolveTarget = this.overlayTextureSS.createView();
			} else {
				console.error("Multi sample texture attachment missing.");
				return;
			}
		}

		const r3depthAttachment = r3renderPassDescriptor.depthStencilAttachment;
		const overlayDepthAttachment = overlayRenderPassDescriptor.depthStencilAttachment;
		if (r3depthAttachment && overlayDepthAttachment && this.depthTexture) {
			r3depthAttachment.view = this.depthTexture.createView();
			overlayDepthAttachment.view = this.depthTexture.createView();
		}

		const r3TimestampWrites = r3renderPassDescriptor.timestampWrites;
		const overlayTimestampWrites = overlayRenderPassDescriptor.timestampWrites;
		const compositingTimestampWrites = compositingRenderPassDescriptor.timestampWrites;
		if (r3TimestampWrites && overlayTimestampWrites && compositingTimestampWrites) {
			r3TimestampWrites.querySet = this.querySet;
			overlayTimestampWrites.querySet = this.querySet;
			compositingTimestampWrites.querySet = this.querySet;
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
				const r3Time = Number(times[1] - times[0]);
				const overlayTime = Number(times[3] - times[2]);
				const compositingTime = Number(times[5] - times[4]);
				// console.log(r3Time / 1000000, overlayTime / 1000000, compositingTime / 1000000);
				this.timeStempMapBuffer.unmap();
				this.viewport.setGPUTime(r3Time, overlayTime, compositingTime);
			});
		}
	}

	public destroy() {

	}
}
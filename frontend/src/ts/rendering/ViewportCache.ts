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
	depthTextureSS?: GPUTexture;
	depthTextureMS?: GPUTexture;
	colorTextureMS?: GPUTexture;
	idTextureSS?: GPUTexture;
	idTextureMS?: GPUTexture;
	selectionDepthRT?: GPUTexture;
	selectionRT?: GPUTexture;
	overlayTextureMS?: GPUTexture;
	overlayTextureSS?: GPUTexture;
	querySet: GPUQuerySet;
	timeStempBufferResolve: GPUBuffer;
	timeStempMapBuffer: GPUBuffer;
	compositingBindGroup0!: GPUBindGroup;
	r16ResolveBindGroup0!: GPUBindGroup;
	project: Project;
	prevUseOverlays: boolean = false;
	constructor(project: Project, viewport: Viewport) {
		this.project = project;
		this.viewport = viewport;

		this.querySet = gpuDevice.createQuerySet({
			label: `time stamp query set for ${viewport.lable}`,
			type: 'timestamp',
			count: 10,
		});
		this.timeStempBufferResolve = gpuDevice.createBuffer({
			label: `time stemp querey resolve buffer for ${viewport.lable}`,
			size: this.querySet.count * 8,
			usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.QUERY_RESOLVE,
		});

		this.timeStempMapBuffer = gpuDevice.createBuffer({
			label: `time stemp map buffer for ${viewport.lable}`,
			size: this.timeStempBufferResolve.size,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
		});
		this.reconfigureContext();
	}

	public conditionalFrambebufferUpdate(config: OutputForwardRenderConfig) {
		const w = this.viewport.getCurrentTexture().width;
		const h = this.viewport.getCurrentTexture().height;
		this.conditionalColorAttachmentUpdate(w, h, config.msaa);
		this.conditionalOverlayAttachmentUpdate(w, h, config);
		if (w === this.prevWidth && h === this.prevHeight && config.msaa === this.prevMSAA && this.prevUseOverlays === this.viewport.useOverlays)
			return;

		if (this.depthTextureSS)
			this.depthTextureSS.destroy();

		this.depthTextureSS = gpuDevice.createTexture({
			size: [w, h, 1],
			format: 'depth24plus',
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			label: "single sample render depth attachment texture",
			sampleCount: 1
		});

		if (this.selectionRT)
			this.selectionRT.destroy();
		this.selectionRT = gpuDevice.createTexture({
			size: [w, h, 1],
			format: 'r8uint',
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
			label: "Selection Attachment",
			sampleCount: 1
		});

		if (this.selectionDepthRT)
			this.selectionDepthRT.destroy();
		this.selectionDepthRT = gpuDevice.createTexture({
			size: [w, h, 1],
			format: 'depth24plus',
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			label: "Selection Depth Attachment",
			sampleCount: 1
		});

		if (this.idTextureSS)
			this.idTextureSS.destroy();
		this.idTextureSS = gpuDevice.createTexture({
			label: "single sample matte attachment",
			size: [w, h, 1],
			format: "r16uint",
			sampleCount: 1,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
		});

		if (config.msaa > 1) {
			if (this.idTextureMS)
				this.idTextureMS.destroy();
			this.idTextureMS = gpuDevice.createTexture({
				label: "multisample id attachment texture",
				size: [w, h, 1],
				format: "r16uint",
				sampleCount: config.msaa,
				usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
			});

			if (this.depthTextureMS)
				this.depthTextureMS.destroy();

			this.depthTextureMS = gpuDevice.createTexture({
				size: [w, h, 1],
				format: 'depth24plus',
				usage: GPUTextureUsage.RENDER_ATTACHMENT,
				label: "multisample render depth Attachment texture",
				sampleCount: config.msaa
			});
		}

		if (this.viewport.useOverlays) {
			if (!this.overlayTextureSS) {
				console.error("Overlay Texture missing!");
				return;
			}
			this.compositingBindGroup0 = gpuDevice.createBindGroup({
				label: "compositing bind group 0",
				entries: [
					{ binding: 0, resource: this.overlayTextureSS.createView() },
					{ binding: 1, resource: this.idTextureSS.createView() },
					{ binding: 2, resource: this.selectionRT.createView() },
				],
				layout: this.project.renderer.compositingBindGroupLayout,
			});
			if (config.msaa > 1) {
				if (!this.idTextureMS) {
					console.error("Multisampled ID Texture missing!");
					return;
				}
				this.r16ResolveBindGroup0 = gpuDevice.createBindGroup({
					label: "R16u resolve bind group 0",
					entries: [
						{ binding: 0, resource: this.idTextureMS.createView() },
					],
					layout: this.project.renderer.r16ResolveBindGroupLayout,
				});
			}
		}

		this.prevWidth = w;
		this.prevHeight = h;
		this.prevMSAA = config.msaa;
		this.prevUseOverlays = this.viewport.useOverlays;
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
		if (!this.viewport.useOverlays) {
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
		r16ResolveRenderPassDescriptor: GPURenderPassDescriptor,
		selectionRenderPassDescriptor: GPURenderPassDescriptor,
		overlayRenderPassDescriptor: GPURenderPassDescriptor,
		compositingRenderPassDescriptor: GPURenderPassDescriptor,
		config: OutputForwardRenderConfig) {
		const colorAttachment = getElement(r3renderPassDescriptor.colorAttachments, 0);
		const idAttachment = getElement(r3renderPassDescriptor.colorAttachments, 1);
		const idResolveAttachment = getElement(r16ResolveRenderPassDescriptor.colorAttachments, 0);
		const selectionAttachment = getElement(selectionRenderPassDescriptor.colorAttachments, 0);
		const overlayColorAttachment = getElement(overlayRenderPassDescriptor.colorAttachments, 0);
		const compositingAttachment = getElement(compositingRenderPassDescriptor.colorAttachments, 0);
		if (!colorAttachment || !overlayColorAttachment || !compositingAttachment || !idAttachment || !idResolveAttachment || !selectionAttachment) {
			console.error("Could not find attachment.");
			return;
		}

		this.conditionalFrambebufferUpdate(config);

		compositingAttachment.view = this.viewport.getCurrentTexture().createView();

		if (!this.idTextureSS) {
			console.error("Single sample id texture attachment is missing.");
			return;
		}

		if (this.viewport.useOverlays) {
			if (!this.selectionRT || !this.selectionDepthRT) {
				console.error("Selection attachment is missing.");
				return;
			}
			selectionAttachment.view = this.selectionRT.createView();
			const selectionDepthAttachment = selectionRenderPassDescriptor.depthStencilAttachment;
			if (selectionDepthAttachment)
				selectionDepthAttachment.view = this.selectionDepthRT.createView();
		}

		if (config.msaa === 1) {
			colorAttachment.view = this.viewport.getCurrentTexture().createView();
			colorAttachment.resolveTarget = undefined;

			idAttachment.view = this.idTextureSS.createView();
			idAttachment.resolveTarget = undefined;

			if (this.viewport.useOverlays) {
				if (!this.overlayTextureSS) {
					console.error("Single sample overlay texture attachment missing.");
					return;
				}
				overlayColorAttachment.view = this.overlayTextureSS.createView();
				overlayColorAttachment.resolveTarget = undefined;
			}

		} else {
			idResolveAttachment.view = this.idTextureSS.createView();
			if (this.colorTextureMS && this.idTextureMS) {
				colorAttachment.view = this.colorTextureMS.createView();
				colorAttachment.resolveTarget = this.viewport.getCurrentTexture().createView();

				idAttachment.view = this.idTextureMS.createView();
				idAttachment.resolveTarget = undefined;

				if (this.viewport.useOverlays) {
					if (!this.overlayTextureSS) {
						console.error("Single sample overlay texture attachment missing.");
						return;
					}
					if (!this.overlayTextureMS) {
						console.error("Multisample sample overlay texture attachment missing.");
						return;
					}
					overlayColorAttachment.view = this.overlayTextureMS.createView();
					overlayColorAttachment.resolveTarget = this.overlayTextureSS.createView();
				}
			} else {
				console.error("Multi sample texture attachment missing.");
				return;
			}
		}

		const r3depthAttachment = r3renderPassDescriptor.depthStencilAttachment;
		const overlayDepthAttachment = overlayRenderPassDescriptor.depthStencilAttachment;
		if (r3depthAttachment && overlayDepthAttachment && this.depthTextureSS) {
			if (config.msaa === 1) {
				r3depthAttachment.view = this.depthTextureSS.createView();
				overlayDepthAttachment.view = this.depthTextureSS.createView();
			} else {
				if (!this.depthTextureMS) {
					console.error("Multisampled depth texture missing.");
					return;
				}
				r3depthAttachment.view = this.depthTextureMS.createView();
				overlayDepthAttachment.view = this.depthTextureMS.createView();
			}

		}

		const r3TimestampWrites = r3renderPassDescriptor.timestampWrites;
		const r16ResolveTimestampWrites = r16ResolveRenderPassDescriptor.timestampWrites;
		const selectionTimestampWrites = selectionRenderPassDescriptor.timestampWrites;
		const overlayTimestampWrites = overlayRenderPassDescriptor.timestampWrites;
		const compositingTimestampWrites = compositingRenderPassDescriptor.timestampWrites;
		if (r3TimestampWrites && overlayTimestampWrites && compositingTimestampWrites && r16ResolveTimestampWrites && selectionTimestampWrites) {
			r3TimestampWrites.querySet = this.querySet;
			r16ResolveTimestampWrites.querySet = this.querySet;
			overlayTimestampWrites.querySet = this.querySet;
			compositingTimestampWrites.querySet = this.querySet;
			selectionTimestampWrites.querySet = this.querySet;
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
	private resetBuffer = new BigInt64Array(10);
	public asyncGPUPerformanceUpdate() {
		if (this.timeStempMapBuffer.mapState === "unmapped") {
			this.timeStempMapBuffer.mapAsync(GPUMapMode.READ).then(() => {
				const times = new BigInt64Array(this.timeStempMapBuffer.getMappedRange());
				const r3Time = Number(times[1] - times[0]);
				const r16Time = Number(times[3] - times[2]);
				const selectionTime = Number(times[5] - times[4]);
				const overlayTime = Number(times[7] - times[6]);
				const compositingTime = Number(times[9] - times[8]);
				// console.log(
				// 	"R3:", r3Time / 1000000,
				// 	"R16 Resolve:", r16Time / 1000000,
				// 	"Selection", selectionTime / 1000000,
				// 	"Overlay", overlayTime / 1000000,
				// 	"Compositing", compositingTime / 1000000,
				// 	"total:", (r3Time + r16Time + selectionTime + overlayTime + compositingTime) / 1000000);

				this.timeStempMapBuffer.unmap();
				gpuDevice.queue.writeBuffer(this.timeStempBufferResolve, 0, this.resetBuffer, 0, this.resetBuffer.length)
				this.viewport.setGPUTime(r3Time, r16Time, selectionTime, overlayTime, compositingTime);
			});
		}
	}

	public destroy() {

	}
}
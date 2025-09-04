import { GeneralConfig, RealtimeConfig, RenderConfig } from "../../c/KayoCorePP";
import { getElement } from "../GPUX";
import { WebGPUViewport } from "./Viewport";
import RealtimeRenderer from "./RealtimeRenderer";
import { Kayo } from "../Kayo";

export class RealtimeViewportCache {
	public viewport: WebGPUViewport;
	public prevWidth = -1;
	public prevHeight = -1;
	public prevMSAA = -1;
	public prevTargetFormat: GPUTextureFormat = "stencil8";
	public depthTextureSS?: GPUTexture;
	public depthTextureMS?: GPUTexture;
	public colorTextureMS?: GPUTexture;
	public idTextureSS?: GPUTexture;
	public idTextureMS?: GPUTexture;
	public selectionDepthRT?: GPUTexture;
	public selectionRT?: GPUTexture;
	public querySet: GPUQuerySet;
	public timeStempBufferResolve: GPUBuffer;
	public timeStempMapBuffer: GPUBuffer;
	public compositingBindGroup0!: GPUBindGroup;
	public r16ResolveBindGroup0!: GPUBindGroup;
	protected _kayo: Kayo;
	public prevUseOverlays: boolean = false;
	public gpuDevice: GPUDevice;
	public constructor(kayo: Kayo, viewport: WebGPUViewport) {
		this._kayo = kayo;
		this.viewport = viewport;
		this.gpuDevice = this._kayo.gpux.gpuDevice;
		this.querySet = this.gpuDevice.createQuerySet({
			label: `time stamp query set for ${viewport.lable}`,
			type: "timestamp",
			count: 10,
		});
		this.timeStempBufferResolve = this.gpuDevice.createBuffer({
			label: `time stemp querey resolve buffer for ${viewport.lable}`,
			size: this.querySet.count * 8,
			usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST | GPUBufferUsage.QUERY_RESOLVE,
		});

		this.timeStempMapBuffer = this.gpuDevice.createBuffer({
			label: `time stemp map buffer for ${viewport.lable}`,
			size: this.timeStempBufferResolve.size,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
		});

		this.reconfigureContext(
			(this._kayo.wasmx.kayoInstance.project.renderConfigs.get(RealtimeRenderer.rendererKey) as RenderConfig)
				.general,
		);
	}

	public conditionalFrambebufferUpdate(config: RenderConfig) {
		const w = this.viewport.getCurrentTexture().width;
		const h = this.viewport.getCurrentTexture().height;
		const specificRenderer: RealtimeConfig = config.specificRenderConfig as RealtimeConfig;
		if (specificRenderer == null) {
			console.error("Specific render config is null!");
			return;
		}
		this.conditionalColorAttachmentUpdate(w, h, config);
		if (
			w === this.prevWidth &&
			h === this.prevHeight &&
			specificRenderer.antialiasing.msaa === this.prevMSAA &&
			this.prevUseOverlays === this.viewport.useOverlays
		)
			return;

		if (this.depthTextureSS) this.depthTextureSS.destroy();

		this.depthTextureSS = this.gpuDevice.createTexture({
			size: [w, h, 1],
			format: "depth24plus",
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			label: "single sample render depth attachment texture",
			sampleCount: 1,
		});

		if (this.selectionRT) this.selectionRT.destroy();
		this.selectionRT = this.gpuDevice.createTexture({
			size: [w, h, 1],
			format: "r8uint",
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
			label: "Selection Attachment",
			sampleCount: 1,
		});

		if (this.selectionDepthRT) this.selectionDepthRT.destroy();
		this.selectionDepthRT = this.gpuDevice.createTexture({
			size: [w, h, 1],
			format: "depth24plus",
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			label: "Selection Depth Attachment",
			sampleCount: 1,
		});

		if (this.idTextureSS) this.idTextureSS.destroy();
		this.idTextureSS = this.gpuDevice.createTexture({
			label: "single sample matte attachment",
			size: [w, h, 1],
			format: "r16uint",
			sampleCount: 1,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
		});

		if (specificRenderer.antialiasing.msaa > 1) {
			if (this.idTextureMS) this.idTextureMS.destroy();
			this.idTextureMS = this.gpuDevice.createTexture({
				label: "multisample id attachment texture",
				size: [w, h, 1],
				format: "r16uint",
				sampleCount: specificRenderer.antialiasing.msaa,
				usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
			});

			if (this.depthTextureMS) this.depthTextureMS.destroy();

			this.depthTextureMS = this.gpuDevice.createTexture({
				size: [w, h, 1],
				format: "depth24plus",
				usage: GPUTextureUsage.RENDER_ATTACHMENT,
				label: "multisample render depth Attachment texture",
				sampleCount: specificRenderer.antialiasing.msaa,
			});
		}

		this.prevWidth = w;
		this.prevHeight = h;
		this.prevMSAA = specificRenderer.antialiasing.msaa;
		this.prevUseOverlays = this.viewport.useOverlays;
	}

	private conditionalColorAttachmentUpdate(w: number, h: number, config: RenderConfig) {
		const currentFormat = this._kayo.gpux.getSwapChainFormat(config.general.swapChain.bitDepth);
		const msaa = (config.specificRenderConfig as RealtimeConfig).antialiasing.msaa;
		if (
			w === this.prevWidth &&
			h === this.prevHeight &&
			msaa === this.prevMSAA &&
			currentFormat === this.prevTargetFormat
		)
			return;
		this.prevTargetFormat = currentFormat;
		if (msaa === 1) {
			// No MSAA
			if (this.colorTextureMS) {
				this.colorTextureMS.destroy();
				this.colorTextureMS = undefined;
			}
			return;
		}
		// Use MSAA
		if (this.colorTextureMS) this.colorTextureMS.destroy();

		this.colorTextureMS = this.gpuDevice.createTexture({
			size: [w, h, 1],
			format: currentFormat,
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			label: "Render Color Attachment",
			sampleCount: msaa,
		});
	}

	public reconfigureContext(generalConfig: GeneralConfig) {
		const context = this.viewport.canvasContext;
		if (!context) return;
		context.unconfigure();
		context.configure({
			device: this.gpuDevice,
			format: this._kayo.gpux.getSwapChainFormat(generalConfig.swapChain.bitDepth),
			colorSpace: generalConfig.swapChain.colorSpace as PredefinedColorSpace,
			toneMapping: { mode: generalConfig.swapChain.toneMappingMode as GPUCanvasToneMappingMode },
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});
	}

	public setupRenderPasses(
		r3renderPassDescriptor: GPURenderPassDescriptor,
		r16ResolveRenderPassDescriptor: GPURenderPassDescriptor,
		selectionRenderPassDescriptor: GPURenderPassDescriptor,
		overlayRenderPassDescriptor: GPURenderPassDescriptor,
		compositingRenderPassDescriptor: GPURenderPassDescriptor,
		config: RenderConfig,
	) {
		const specificRenderer: RealtimeConfig = config.specificRenderConfig as RealtimeConfig;
		if (specificRenderer === null) {
			console.error("Specific renderer config is null!");
			return;
		}
		const colorAttachment = getElement(r3renderPassDescriptor.colorAttachments, 0);
		const idAttachment = getElement(r3renderPassDescriptor.colorAttachments, 1);
		const idResolveAttachment = getElement(r16ResolveRenderPassDescriptor.colorAttachments, 0);
		const selectionAttachment = getElement(selectionRenderPassDescriptor.colorAttachments, 0);
		const overlayColorAttachment = getElement(overlayRenderPassDescriptor.colorAttachments, 0);
		const compositingAttachment = getElement(compositingRenderPassDescriptor.colorAttachments, 0);
		if (
			!colorAttachment ||
			!overlayColorAttachment ||
			!compositingAttachment ||
			!idAttachment ||
			!idResolveAttachment ||
			!selectionAttachment
		) {
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
			if (selectionDepthAttachment) selectionDepthAttachment.view = this.selectionDepthRT.createView();
		}

		if (specificRenderer.antialiasing.msaa === 1) {
			colorAttachment.view = this.viewport.getCurrentTexture().createView();
			colorAttachment.resolveTarget = undefined;

			idAttachment.view = this.idTextureSS.createView();
			idAttachment.resolveTarget = undefined;
		} else {
			idResolveAttachment.view = this.idTextureSS.createView();
			if (this.colorTextureMS && this.idTextureMS) {
				colorAttachment.view = this.colorTextureMS.createView();
				colorAttachment.resolveTarget = this.viewport.getCurrentTexture().createView();

				idAttachment.view = this.idTextureMS.createView();
				idAttachment.resolveTarget = undefined;
			} else {
				console.error("Multi sample texture attachment missing.");
				return;
			}
		}

		const r3depthAttachment = r3renderPassDescriptor.depthStencilAttachment;
		const overlayDepthAttachment = overlayRenderPassDescriptor.depthStencilAttachment;
		if (r3depthAttachment && overlayDepthAttachment && this.depthTextureSS) {
			if (specificRenderer.antialiasing.msaa === 1) {
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
		if (
			r3TimestampWrites &&
			overlayTimestampWrites &&
			compositingTimestampWrites &&
			r16ResolveTimestampWrites &&
			selectionTimestampWrites
		) {
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
				this.timeStempBufferResolve,
				0,
				this.timeStempMapBuffer,
				0,
				this.timeStempBufferResolve.size,
			);
		}
	}
	private resetBuffer = new BigInt64Array(10);
	public asyncGPUPerformanceUpdate(jsTime: number) {
		if (this.timeStempMapBuffer.mapState !== "unmapped") return;

		this.timeStempMapBuffer.mapAsync(GPUMapMode.READ).then(() => {
			const times = new BigInt64Array(this.timeStempMapBuffer.getMappedRange());
			const r3Time = Number(times[1] - times[0]) / 1000000;
			const r16Time = Number(times[3] - times[2]) / 1000000;
			const selectionTime = Number(times[5] - times[4]) / 1000000;
			const overlayTime = Number(times[7] - times[6]) / 1000000;
			const compositingTime = Number(times[9] - times[8]) / 1000000;

			this.timeStempMapBuffer.unmap();
			this.gpuDevice.queue.writeBuffer(
				this.timeStempBufferResolve,
				0,
				this.resetBuffer,
				0,
				this.resetBuffer.length,
			);
			this.viewport.setGPUTime({
				JavaScript: jsTime,
				Render: r3Time,
				indexResolve: r16Time,
				Selection: selectionTime,
				Overlays: overlayTime,
				compositingTime: compositingTime,
			});
		});
	}

	public destroy() {}
}

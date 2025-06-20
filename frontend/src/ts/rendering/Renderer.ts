import { Project } from "../project/Project";
import { Viewport } from "./Viewport";
import { ViewportCache } from "./ViewportCache";
import { CompositingPipeline } from "./CompositingPipeline";
import { ResolvePipeline } from "./ResolvePipeline";
import Camera from "../Viewport/Camera";
import { MinecraftOpaquePipeline } from "../minecraft/MinecraftOpaquePipeline";
import { DisplayInfo } from "../Material/AbstractRenderingPipeline";
import { VirtualTextureSystem } from "../Textures/VirtualTextureSystem";
import { ViewportPane } from "../ui/panes/ViewportPane";
import { RealtimeConfig, RenderConfig, RenderState } from "../../c/KayoCorePP";

export default class Renderer {
	project: Project;
	viewportPanes = new Set<ViewportPane>();

	private r3renderPassDescriptor: GPURenderPassDescriptor;
	private overlayRenderPassDescriptor: GPURenderPassDescriptor;
	private selectionRenderPassDescriptor: GPURenderPassDescriptor;
	private r16ResolveRenderPassDescriptor: GPURenderPassDescriptor;
	private compositingRenderPassDescriptor: GPURenderPassDescriptor;

	private requestedAnimationFrame: Map<Window, boolean> = new Map<Window, boolean>();
	private viewportsToUpdate = new Set<Viewport>();
	private registeredViewports = new Set<Viewport>();
	private viewportCache = new Map<Viewport, ViewportCache>();
	private viewUBO: GPUBuffer;
	private gpuDevice: GPUDevice;
	bindGroup0: GPUBindGroup;
	bindGroup0Layout: GPUBindGroupLayout;
	bindGroupR3Layout: GPUBindGroupLayout;

	compositingPipeline!: CompositingPipeline;
	compositingBindGroupLayout: GPUBindGroupLayout;

	r16ResolvePipeline!: ResolvePipeline;
	r16ResolveBindGroupLayout: GPUBindGroupLayout;
	heightFieldComputePassDescriptor: GPUComputePassDescriptor;
	shadowViewUBO: GPUBuffer;
	shadowBindGroup0: GPUBindGroup;
	virtualTextureSystem: VirtualTextureSystem;

	constructor(project: Project) {
		this.project = project;
		this.gpuDevice = project.gpux.gpuDevice;
		this.reconfigureContext(
			(this.project.wasmx.kayoInstance.project.renderStates.get("default") as RenderState).config,
		);
		this.viewUBO = this.gpuDevice.createBuffer({
			label: "View UBO",
			size: (3 * 16 + 12) * 4,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
		});
		this.shadowViewUBO = this.gpuDevice.createBuffer({
			label: "shadow view UBO",
			size: (3 * 16 + 12) * 4,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
		});
		this.virtualTextureSystem = new VirtualTextureSystem(this.project.gpux);
		this.bindGroup0Layout = this.gpuDevice.createBindGroupLayout({
			label: "Global default bind group 0 layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
					buffer: {
						type: "uniform",
					},
				},
				...VirtualTextureSystem.bindGroupEntries,
			],
		});
		this.bindGroupR3Layout = this.gpuDevice.createBindGroupLayout({
			label: "Default R3 bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer: {
						type: "uniform",
					},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "uniform",
					},
				},
			],
		});
		this.compositingBindGroupLayout = this.gpuDevice.createBindGroupLayout({
			label: "Compositing bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "unfilterable-float",
						multisampled: false,
						viewDimension: "2d",
					},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "uint",
						multisampled: false,
						viewDimension: "2d",
					},
				},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "uint",
						multisampled: false,
						viewDimension: "2d",
					},
				},
			],
		});
		this.r16ResolveBindGroupLayout = this.gpuDevice.createBindGroupLayout({
			label: "R16u resolve bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "uint",
						multisampled: true,
						viewDimension: "2d",
					},
				},
			],
		});
		this.bindGroup0 = this.gpuDevice.createBindGroup({
			label: "Global default bind group 0",
			entries: [
				{ binding: 0, resource: { buffer: this.viewUBO } },
				...this.virtualTextureSystem.bindGroupEntries,
			],
			layout: this.bindGroup0Layout,
		});
		this.shadowBindGroup0 = this.gpuDevice.createBindGroup({
			label: "Global default shadow bind group 0",
			entries: [
				{ binding: 0, resource: { buffer: this.shadowViewUBO } },
				...this.virtualTextureSystem.bindGroupEntries,
			],
			layout: this.bindGroup0Layout,
		});
		this.r3renderPassDescriptor = {
			label: "Render Pass",
			colorAttachments: [
				{
					loadOp: "clear",
					storeOp: "store",
					clearValue: [0.0, 0.0, 0.0, 0.0],
					view: null as unknown as GPUTextureView,
				},
				{
					loadOp: "clear",
					storeOp: "store",
					clearValue: [0, 0, 0, 0],
					view: null as unknown as GPUTextureView,
				},
			],
			depthStencilAttachment: {
				depthClearValue: 1.0,
				depthLoadOp: "clear",
				depthStoreOp: "store",
				view: null as unknown as GPUTextureView,
			},
			timestampWrites: {
				querySet: null as unknown as GPUQuerySet,
				beginningOfPassWriteIndex: 0,
				endOfPassWriteIndex: 1,
			},
		};
		this.r16ResolveRenderPassDescriptor = {
			label: "r16 Resolve Render Pass",
			colorAttachments: [
				{
					loadOp: "clear",
					clearValue: [0, 0, 0, 0],
					storeOp: "store",
					view: null as unknown as GPUTextureView,
				},
			],
			timestampWrites: {
				querySet: null as unknown as GPUQuerySet,
				beginningOfPassWriteIndex: 2,
				endOfPassWriteIndex: 3,
			},
		};
		this.selectionRenderPassDescriptor = {
			label: "Selection Render Pass",
			colorAttachments: [
				{
					loadOp: "clear",
					storeOp: "store",
					clearValue: [0, 0, 0, 0],
					view: null as unknown as GPUTextureView,
				},
			],
			depthStencilAttachment: {
				depthLoadOp: "clear",
				depthClearValue: 1.0,
				depthStoreOp: "store",
				view: null as unknown as GPUTextureView,
			},
			timestampWrites: {
				querySet: null as unknown as GPUQuerySet,
				beginningOfPassWriteIndex: 4,
				endOfPassWriteIndex: 5,
			},
		};
		this.overlayRenderPassDescriptor = {
			label: "Overlay Render Pass",
			colorAttachments: [
				{
					loadOp: "clear",
					storeOp: "store",
					clearValue: [0, 0, 0, 0],
					view: null as unknown as GPUTextureView,
				},
			],
			depthStencilAttachment: {
				depthLoadOp: "load",
				depthStoreOp: "discard",
				view: null as unknown as GPUTextureView,
			},
			timestampWrites: {
				querySet: null as unknown as GPUQuerySet,
				beginningOfPassWriteIndex: 6,
				endOfPassWriteIndex: 7,
			},
		};
		this.compositingRenderPassDescriptor = {
			label: "compositing render pass",
			colorAttachments: [
				{
					loadOp: "load",
					storeOp: "store",
					view: null as unknown as GPUTextureView,
				},
			],
			timestampWrites: {
				querySet: null as unknown as GPUQuerySet,
				beginningOfPassWriteIndex: 8,
				endOfPassWriteIndex: 9,
			},
		};
		this.heightFieldComputePassDescriptor = {
			label: "height field compute pass",
		};
	}

	reconfigureContext(config: RenderConfig) {
		for (const [, viewportCache] of this.viewportCache) viewportCache.reconfigureContext(config.general);
	}

	rebuildDisplayOutputPipelines(config: RenderConfig) {
		const outConsts = this.project.getDisplayFragmentOutputConstants();
		const format = this.project.getSwapChainFormat(config.general);
		const msaa = (config.specificRenderer as RealtimeConfig).antialiasing.msaa;

		const surfaceInfo: DisplayInfo = {
			gpuDevice: this.gpuDevice,
			targetColorSpace: outConsts.targetColorSpace,
			componentTransfere: outConsts.componentTranfere,
			msaa: msaa,
			format: format,
		};
		for (const hf of this.project.scene.heightFieldObjects) hf.pipeline.updateDisplayProperties(surfaceInfo);

		const gp = this.project.scene.gridPipeline;
		if (gp) gp.updateDisplayProperties(surfaceInfo);

		const background = this.project.scene.background.pipeline;
		background.updateDisplayProperties(surfaceInfo);

		const minePipe = MinecraftOpaquePipeline.pipeline;
		minePipe.updateDisplayProperties(surfaceInfo);

		this.compositingPipeline.fragmentTargets[0].format = format;
		this.compositingPipeline.buildPipeline(this.gpuDevice);
	}

	init() {
		this.compositingPipeline = new CompositingPipeline(this.project, "Compositing Pipeline");
		this.r16ResolvePipeline = new ResolvePipeline(this.project, "R16u resolve pipeline", "r16uint", "u32", "x");
	}

	jsTime = "";
	frame = 0;
	loop = (_: number, viewport: Viewport) => {
		const start = performance.now();
		const renderState = this.project.wasmx.kayoInstance.project.renderStates.get(viewport.configKey);
		if (renderState === null) {
			console.error(`The render config key ${viewport.configKey} is unknown.`);
			return;
		}
		renderState.applyToConfig();
		const config = renderState.config;
		const specificRenderer: RealtimeConfig = config.specificRenderer as RealtimeConfig;
		if (specificRenderer === null) {
			console.error("Specific renderer config is null!");
			return;
		}

		this.requestedAnimationFrame.set(window, false);

		if (config.needsContextReconfiguration) this.reconfigureContext(config);

		if (config.needsPipelineRebuild) this.rebuildDisplayOutputPipelines(config);

		for (const viewport of this.viewportsToUpdate) {
			viewport.updateView(this.viewUBO, this.frame);
			if (
				viewport.canvasContext &&
				viewport.canvasContext.canvas.width === 0 &&
				viewport.canvasContext.canvas.height === 0
			) {
				continue;
			}
			const viewportCache = this.viewportCache.get(viewport);
			if (!viewportCache) {
				console.error("Could not find viewport cache.");
				continue;
			}
			const commandEncoder = this.gpuDevice.createCommandEncoder();
			viewportCache.setupRenderPasses(
				this.r3renderPassDescriptor,
				this.r16ResolveRenderPassDescriptor,
				this.selectionRenderPassDescriptor,
				this.overlayRenderPassDescriptor,
				this.compositingRenderPassDescriptor,
				config,
			);

			const w = viewport.getCurrentTexture().width;
			const h = viewport.getCurrentTexture().height;

			const heightFieldComputeEncoder = commandEncoder.beginComputePass(this.heightFieldComputePassDescriptor);
			heightFieldComputeEncoder.setBindGroup(0, this.bindGroup0);
			for (const hf of this.project.scene.heightFieldObjects) {
				hf.compute(heightFieldComputeEncoder);
			}
			heightFieldComputeEncoder.end();

			for (const sun of this.project.scene.sunlights) {
				this.updateView(this.shadowViewUBO, this.frame, sun, sun.resolution, sun.resolution);
				sun.updateSunUniforms(this.gpuDevice);
				const shadowRenderPassEncoder = commandEncoder.beginRenderPass(sun.renderPass);
				shadowRenderPassEncoder.setViewport(0, 0, sun.resolution, sun.resolution, 0, 1);
				shadowRenderPassEncoder.setBindGroup(0, this.shadowBindGroup0);
				for (const hf of this.project.scene.heightFieldObjects) {
					hf.renderDepth(shadowRenderPassEncoder);
				}

				shadowRenderPassEncoder.end();
			}

			const r3renderPassEncoder = commandEncoder.beginRenderPass(this.r3renderPassDescriptor);
			r3renderPassEncoder.setViewport(0, 0, w, h, 0, 1);

			this.project.scene.background.recordForwardRendering(r3renderPassEncoder);

			r3renderPassEncoder.setBindGroup(0, this.bindGroup0);
			r3renderPassEncoder.setBindGroup(3, Array.from(this.project.scene.sunlights)[0].bindGroup);
			for (const hf of this.project.scene.heightFieldObjects) {
				hf.render(r3renderPassEncoder);
			}

			this.project.scene.minecraftWorld?.renderBundle(r3renderPassEncoder);
			r3renderPassEncoder.end();

			if (viewport.useOverlays) {
				if ((config.specificRenderer as RealtimeConfig).antialiasing.msaa > 1) {
					const r16ResolveRenderPassEncode = commandEncoder.beginRenderPass(
						this.r16ResolveRenderPassDescriptor,
					);
					r16ResolveRenderPassEncode.setViewport(0, 0, w, h, 0, 1);
					r16ResolveRenderPassEncode.setBindGroup(0, viewportCache.r16ResolveBindGroup0);
					r16ResolveRenderPassEncode.setPipeline(this.r16ResolvePipeline.gpuPipeline);
					r16ResolveRenderPassEncode.draw(4);
					r16ResolveRenderPassEncode.end();
				}

				const selectionRenderPassEncoder = commandEncoder.beginRenderPass(this.selectionRenderPassDescriptor);
				selectionRenderPassEncoder.setViewport(0, 0, w, h, 0, 1);
				selectionRenderPassEncoder.setBindGroup(0, this.bindGroup0);

				for (const hf of this.project.scene.heightFieldObjects) {
					if (hf.isActive || hf.isSelected) hf.renderSelection(selectionRenderPassEncoder);
				}
				selectionRenderPassEncoder.end();

				const overlayRenderPassEncoder = commandEncoder.beginRenderPass(this.overlayRenderPassDescriptor);
				overlayRenderPassEncoder.setViewport(0, 0, w, h, 0, 1);
				overlayRenderPassEncoder.setBindGroup(0, this.bindGroup0);
				if (this.project.scene.gridPipeline)
					this.project.scene.gridPipeline.recordForwardRendering(overlayRenderPassEncoder);

				overlayRenderPassEncoder.end();

				const compositingRenderPassEncoder = commandEncoder.beginRenderPass(
					this.compositingRenderPassDescriptor,
				);
				compositingRenderPassEncoder.setViewport(0, 0, w, h, 0, 1);
				compositingRenderPassEncoder.setBindGroup(0, viewportCache.compositingBindGroup0);
				compositingRenderPassEncoder.setPipeline(this.compositingPipeline.gpuPipeline);
				compositingRenderPassEncoder.draw(4);
				compositingRenderPassEncoder.end();
			}

			viewportCache.resolvePerformanceQueryCommand(commandEncoder);
			this.gpuDevice.queue.submit([commandEncoder.finish()]);
			viewportCache.asyncGPUPerformanceUpdate();
		}

		this.jsTime = `${(performance.now() - start).toFixed(3)}ms`;
		this.viewportsToUpdate.clear();
		this.frame++;
		// for(const v of this.registeredViewports)
		// 	this.requestAnimationFrameWith(v);
	};

	requestAnimationFrameWith(viewport: Viewport) {
		if (!this.registeredViewports.has(viewport)) {
			console.warn("Viewport is not registered.");
			return;
		}
		this.viewportsToUpdate.add(viewport);
		if (this.requestedAnimationFrame.get(viewport.window) === true) return;

		this.requestedAnimationFrame.set(viewport.window, true);
		viewport.window.requestAnimationFrame((ts: number) => {
			this.loop(ts, viewport);
		});
	}

	registerViewport(viewport: Viewport) {
		if (this.registeredViewports.has(viewport)) return;

		this.registeredViewports.add(viewport);
		this.viewportCache.set(viewport, new ViewportCache(this.project, viewport));
	}

	unregisterViewport(viewport: Viewport) {
		if (!this.registeredViewports.has(viewport)) return;

		this.registeredViewports.delete(viewport);
		const cache = this.viewportCache.get(viewport);
		if (cache) cache.destroy();
		this.viewportCache.delete(viewport);
	}

	getNew3RData(): { vertexUniformBuffer: GPUBuffer; fragmentUniformBuffer: GPUBuffer; bindGroup: GPUBindGroup } {
		const vertexUniformBuffer = this.gpuDevice.createBuffer({
			label: "R3 default vertex uniforms buffer",
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
			size: 16 * 4,
		});
		const fragmentUniformBuffer = this.gpuDevice.createBuffer({
			label: "R3 default fragment uniforms buffer",
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
			size: 4 * 4,
		});
		const bindGroup = this.gpuDevice.createBindGroup({
			label: "R3 Bind Group",
			entries: [
				{
					binding: 0,
					resource: {
						label: "R3 bind group vertex uniform resource",
						buffer: vertexUniformBuffer,
					},
				},
				{
					binding: 1,
					resource: {
						label: "R3 bind group fragment uniform resource",
						buffer: fragmentUniformBuffer,
					},
				},
			],
			layout: this.bindGroupR3Layout,
		});
		return { vertexUniformBuffer, fragmentUniformBuffer, bindGroup };
	}

	static getDepthStencilFormat(): GPUTextureFormat {
		return "depth24plus";
	}

	private viewBuffer = new Float32Array(3 * 16 + 4);
	private viewTimeBuffer = new Uint32Array(8);
	updateView(viewUBO: GPUBuffer, frame: number, camera: Camera, width: number, height: number): void {
		const projection = camera.getProjection();
		const near = projection.near;
		const far = projection.far;
		camera.getViewMatrix().pushInFloat32ArrayColumnMajor(this.viewBuffer);
		projection.getProjectionMatrix(width, height).pushInFloat32ArrayColumnMajor(this.viewBuffer, 16);
		camera.transformationStack.getTransformationMatrix().pushInFloat32ArrayColumnMajor(this.viewBuffer, 2 * 16);
		this.viewBuffer.set([near, far, window.devicePixelRatio, 0], 3 * 16);
		this.gpuDevice.queue.writeBuffer(viewUBO, 0, this.viewBuffer);

		this.viewTimeBuffer.set([0, 0, width, height, frame, 0, 0, 0], 0);
		this.gpuDevice.queue.writeBuffer(viewUBO, this.viewBuffer.byteLength, this.viewTimeBuffer);
	}
}

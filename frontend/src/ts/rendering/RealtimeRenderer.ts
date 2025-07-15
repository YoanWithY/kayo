import { Project } from "../project/Project";
import { Viewport } from "./Viewport";
import { RealtimeViewportCache } from "./ViewportCache";
import { CompositingPipeline } from "./CompositingPipeline";
import { ResolvePipeline } from "./ResolvePipeline";
import Camera from "../Viewport/Camera";
import { VirtualTextureSystem } from "../Textures/VirtualTextureSystem";
import { RealtimeConfig, RenderConfig, RenderState } from "../../c/KayoCorePP";
import { AbstractMetaRenderPipeline } from "./AbstractMetaRenderingPipeline";
const thresholdMapURL = "/beyer_2px_16bit.png";

const thresholdMapBlob = await fetch(thresholdMapURL);
const thresholdMapBytes = await thresholdMapBlob.bytes();

export default class RealtimeRenderer {
	public static readonly rendererKey = "realtime";
	public get rendererKey() {
		return RealtimeRenderer.rendererKey;
	}
	public project: Project;

	private r3renderPassDescriptor: GPURenderPassDescriptor;
	private overlayRenderPassDescriptor: GPURenderPassDescriptor;
	private selectionRenderPassDescriptor: GPURenderPassDescriptor;
	private r16ResolveRenderPassDescriptor: GPURenderPassDescriptor;
	private compositingRenderPassDescriptor: GPURenderPassDescriptor;

	public registeredViewports = new Set<Viewport>();
	private viewportCache = new Map<Viewport, RealtimeViewportCache>();
	private viewUBO: GPUBuffer;
	private gpuDevice: GPUDevice;
	public bindGroup0!: GPUBindGroup;
	public bindGroup0Layout: GPUBindGroupLayout;
	public bindGroupR3Layout: GPUBindGroupLayout;

	public compositingPipeline!: CompositingPipeline;
	public compositingBindGroupLayout: GPUBindGroupLayout;

	public r16ResolvePipeline!: ResolvePipeline;
	public r16ResolveBindGroupLayout: GPUBindGroupLayout;
	public heightFieldComputePassDescriptor: GPUComputePassDescriptor;
	public shadowViewUBO: GPUBuffer;
	public shadowBindGroup0!: GPUBindGroup;
	public blueNoiseTexture!: GPUTexture;
	public blueNoiseView!: GPUTextureView;

	public constructor(project: Project) {
		this.project = project;
		this.gpuDevice = project.gpux.gpuDevice;
		this.reconfigureContext(
			(this.project.wasmx.kayoInstance.project.renderStates.get(this.rendererKey) as RenderState).config,
		);
		this.viewUBO = this.gpuDevice.createBuffer({
			label: "View UBO",
			size: (3 * 16 + 4 * 4) * 4,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
		});
		this.shadowViewUBO = this.gpuDevice.createBuffer({
			label: "shadow view UBO",
			size: (3 * 16 + 12) * 4,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
		});
		this.bindGroup0Layout = this.gpuDevice.createBindGroupLayout({
			label: "Global realtime bind group 0 layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
					buffer: {
						type: "uniform",
					},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
					texture: {
						viewDimension: "2d",
						sampleType: "uint",
					},
				},
				...VirtualTextureSystem.bindGroupLayoutEntries,
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

		const imageData = project.wasmx.imageData.fromImageData(thresholdMapBytes);
		if (!imageData) return;

		const blueNoiseData = project.wasmx.getBufferView(imageData.data);
		this.blueNoiseTexture = this.gpuDevice.createTexture({
			label: "blue noise texture",
			format: "r16uint",
			size: { width: imageData.width, height: imageData.height, depthOrArrayLayers: 1 },
			usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
			dimension: "2d",
			mipLevelCount: 1,
			sampleCount: 1,
			viewFormats: ["r16uint"],
		});
		this.blueNoiseView = this.blueNoiseTexture.createView({
			label: "blue noise view",
			aspect: "all",
			baseMipLevel: 0,
			mipLevelCount: 1,
			baseArrayLayer: 0,
			arrayLayerCount: 1,
			dimension: "2d",
			format: "r16uint",
			usage: GPUTextureUsage.TEXTURE_BINDING,
		});

		this.gpuDevice.queue.writeTexture(
			{ texture: this.blueNoiseTexture },
			blueNoiseData,
			{ bytesPerRow: imageData.width * imageData.components * imageData.bytesPerComponents },
			{ width: imageData.width, height: imageData.height, depthOrArrayLayers: 1 },
		);

		this.shadowBindGroup0 = this.gpuDevice.createBindGroup({
			label: "Global default shadow bind group 0",
			entries: [
				{ binding: 0, resource: { buffer: this.shadowViewUBO } },
				{ binding: 1, resource: this.blueNoiseView },
				...this.project.virtualTextureSystem.bindGroupEntries,
			],
			layout: this.bindGroup0Layout,
		});

		this.bindGroup0 = this.gpuDevice.createBindGroup({
			label: "Global default bind group 0",
			entries: [
				{ binding: 0, resource: { buffer: this.viewUBO } },
				{ binding: 1, resource: this.blueNoiseView },
				...this.project.virtualTextureSystem.bindGroupEntries,
			],
			layout: this.bindGroup0Layout,
		});

		imageData.deleteLater();
	}

	public reconfigureContext(config: RenderConfig) {
		for (const [, viewportCache] of this.viewportCache) viewportCache.reconfigureContext(config.general);
	}

	public jsTime = "";
	public frame = 0;
	public renderViewport(_: number, viewport: Viewport) {
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

		if (config.needsContextReconfiguration) this.reconfigureContext(config);

		viewport.updateView(this.viewUBO, this.frame);
		const key = AbstractMetaRenderPipeline.configToKey(
			config.general,
			(config.specificRenderer as RealtimeConfig).antialiasing.msaa as 1 | 4,
		);

		const viewportCache = this.viewportCache.get(viewport);
		if (!viewportCache) {
			console.error("Could not find viewport cache.");
			return;
		}
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

		const commandEncoder = this.gpuDevice.createCommandEncoder();
		const r3renderPassEncoder = commandEncoder.beginRenderPass(this.r3renderPassDescriptor);
		r3renderPassEncoder.setViewport(0, 0, w, h, 0, 1);

		this.project.scene.background.recordForwardRendering(r3renderPassEncoder, key);
		this.project.scene.grid?.recordForwardRendering(r3renderPassEncoder, key);
		r3renderPassEncoder.end();

		viewportCache.resolvePerformanceQueryCommand(commandEncoder);
		this.gpuDevice.queue.submit([commandEncoder.finish()]);
		viewportCache.asyncGPUPerformanceUpdate(performance.now() - start);

		this.frame++;
	}

	public registerViewport(viewport: Viewport) {
		if (this.registeredViewports.has(viewport)) return;

		this.registeredViewports.add(viewport);
		this.viewportCache.set(viewport, new RealtimeViewportCache(this.project, viewport));
	}

	public unregisterViewport(viewport: Viewport) {
		if (!this.registeredViewports.has(viewport)) return;

		this.registeredViewports.delete(viewport);
		const cache = this.viewportCache.get(viewport);
		if (cache) cache.destroy();
		this.viewportCache.delete(viewport);
	}

	public getNew3RData(): {
		vertexUniformBuffer: GPUBuffer;
		fragmentUniformBuffer: GPUBuffer;
		bindGroup: GPUBindGroup;
	} {
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

	public static getDepthStencilFormat(): GPUTextureFormat {
		return "depth24plus";
	}

	private viewBuffer = new Float32Array(3 * 16 + 4);
	private viewTimeBuffer = new Uint32Array(8);
	public updateView(viewUBO: GPUBuffer, frame: number, camera: Camera, width: number, height: number): void {
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

import { Viewport } from "../Viewport/Viewport";
import { RealtimeViewportCache } from "./ViewportCache";
import { CompositingPipeline } from "./CompositingPipeline";
import { ResolvePipeline } from "./ResolvePipeline";
import { VirtualTextureSystem } from "../Textures/VirtualTextureSystem";
import { KayoInstance } from "../KayoInstance";
import { Renderer3D } from "../Renderer";
import { RepresentationConcept } from "../project/Representation";
import { GPUX } from "../GPUX";
import { BackgroundRealtimeRenderingRepresentation } from "../lights/Background";
import { SceneRealtimeRepresentation } from "./SceneRealtimeRepresentation";
import { GridRealtimeRepresentation } from "../debug/Grid";
import { MinecraftWorldRealtimeRenderingRepresentation } from "../minecraft/MinecraftOpaquePipeline";
import { RenderConfig } from "./config/RenderConfig";
import { RealtimeConfigObject, RealtimeSpecificRenderConfig } from "./config/RealtimeRenderConfig";
import { UI3DViewport } from "../Viewport/UIViewport";
import { Scene } from "../project/Scene";
import { Camera } from "../Viewport/Camera";
import { KayoNumber } from "../../c/KayoCorePP";
const thresholdMapURL = "/beyer_4px_16bit.png";

// eslint-disable-next-line local/no-await
const thresholdMapBlob = await fetch(thresholdMapURL);
// eslint-disable-next-line local/no-await
const thresholdMapBytes = await thresholdMapBlob.bytes();

export class RealtimeRenderer implements RepresentationConcept, Renderer3D {
	protected _kayo: KayoInstance;

	private r3renderPassDescriptor: GPURenderPassDescriptor;
	private overlayRenderPassDescriptor: GPURenderPassDescriptor;
	private selectionRenderPassDescriptor: GPURenderPassDescriptor;
	private r16ResolveRenderPassDescriptor: GPURenderPassDescriptor;
	private compositingRenderPassDescriptor: GPURenderPassDescriptor;

	public registeredViewports = new Set<UI3DViewport>();
	private viewportCache = new Map<Viewport, RealtimeViewportCache>();
	private viewUBO: GPUBuffer;
	private gpuDevice: GPUDevice;
	private _config: RenderConfig;
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

	public constructor(kayo: KayoInstance, config: RenderConfig) {
		this._kayo = kayo;
		this.gpuDevice = kayo.gpux.gpuDevice;
		this._config = config;
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

		const imageData = this._kayo.wasmx.imageData.fromImageData(thresholdMapBytes, false);
		if (!imageData) return;

		const blueNoiseData = imageData.getMipData(0);
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
			{ bytesPerRow: imageData.bytesPerRow },
			{ width: imageData.width, height: imageData.height, depthOrArrayLayers: 1 },
		);

		this.shadowBindGroup0 = this.gpuDevice.createBindGroup({
			label: "Global default shadow bind group 0",
			entries: [
				{ binding: 0, resource: { buffer: this.shadowViewUBO } },
				{ binding: 1, resource: this.blueNoiseView },
				...this._kayo.virtualTextureSystem.bindGroupEntries,
			],
			layout: this.bindGroup0Layout,
		});

		this.bindGroup0 = this.gpuDevice.createBindGroup({
			label: "Global default bind group 0",
			entries: [
				{ binding: 0, resource: { buffer: this.viewUBO } },
				{ binding: 1, resource: this.blueNoiseView },
				...this._kayo.virtualTextureSystem.bindGroupEntries,
			],
			layout: this.bindGroup0Layout,
		});

		imageData.deleteLater();

		BackgroundRealtimeRenderingRepresentation.init(this._kayo.gpux, this.bindGroup0Layout);
		GridRealtimeRepresentation.init(this._kayo.gpux, this.bindGroup0Layout);
		MinecraftWorldRealtimeRenderingRepresentation.init(this._kayo.gpux, this.bindGroup0Layout);
	}

	public reconfigureContext(config: RealtimeConfigObject) {
		for (const [, viewportCache] of this.viewportCache) viewportCache.reconfigureContext(config);
	}

	public jsTime = "";
	public frame = 0;
	private _configCache: {
		toneMappingMode: string;
		colorSpace: string;
		bitDepth: 8 | 16;
		useCustomColorQuantization: boolean;
		useDithering: boolean;
		msaa: 1 | 4;
		interpolation: string;
	} = {
			toneMappingMode: "",
			colorSpace: "",
			bitDepth: -1 as any,
			useCustomColorQuantization: undefined as any,
			useDithering: undefined as any,
			msaa: -1 as any,
			interpolation: "",
		};

	private _compareAndUpdateConfigCache(config: RenderConfig, currentTime: KayoNumber) {
		let needsPipelineRebuild = false;
		let needsContextReconfiguration = false;
		const general = config.general;

		const currentBitDepth = general.swapChain.bitDepthEnum.getKeyByIndex(general.swapChain.bitDepth.sample(currentTime)) as 8 | 16;
		if (currentBitDepth !== this._configCache.bitDepth) {
			needsContextReconfiguration = true;
			needsPipelineRebuild = true;
		}
		this._configCache.bitDepth = currentBitDepth;

		const currentToneMappingMode = general.swapChain.toneMappingModeEnum.getKeyByIndex(general.swapChain.toneMappingMode.sample(currentTime)) as string;
		if (currentToneMappingMode !== this._configCache.toneMappingMode) {
			needsContextReconfiguration = true;
		}
		this._configCache.toneMappingMode = currentToneMappingMode;

		const currentColorSpace = general.swapChain.colorSpaceEnum.getKeyByIndex(general.swapChain.colorSpace.sample(currentTime)) as string;
		if (currentColorSpace !== this._configCache.colorSpace) {
			needsPipelineRebuild = true;
			needsContextReconfiguration = true;
		}
		this._configCache.colorSpace = currentColorSpace;

		const currentUseCustomColorQuantization = general.customColorQuantisation.useCustomColorQuantization.sample(currentTime);
		if (currentUseCustomColorQuantization !== this._configCache.useCustomColorQuantization)
			needsPipelineRebuild = true;
		this._configCache.useCustomColorQuantization = currentUseCustomColorQuantization;

		const currentUseDithering = general.customColorQuantisation.useDithering.sample(currentTime);
		if (currentUseDithering !== this._configCache.useDithering)
			needsPipelineRebuild = true;
		this._configCache.useDithering = currentUseDithering;

		const realtimeConfig = config.specific as RealtimeSpecificRenderConfig;

		const currentMSAA = realtimeConfig.antialiasing.msaaEnum.getKeyByIndex(realtimeConfig.antialiasing.msaa.sample(currentTime)) as 1 | 4;
		if (currentMSAA !== this._configCache.msaa)
			needsPipelineRebuild = true;
		this._configCache.msaa = currentMSAA;

		const currentInterpolation = realtimeConfig.antialiasing.interpolationEnum.getKeyByIndex(realtimeConfig.antialiasing.interpolation.sample(currentTime)) as string;
		if (currentInterpolation !== this._configCache.interpolation)
			needsPipelineRebuild = true;
		this._configCache.interpolation = currentInterpolation;

		return { needsContextReconfiguration, needsPipelineRebuild };
	}

	public renderViewport(currentTime: KayoNumber, viewport: UI3DViewport) {
		const start = performance.now();
		const config = this._config;
		const { needsContextReconfiguration, needsPipelineRebuild } = this._compareAndUpdateConfigCache(config, currentTime);
		if (needsPipelineRebuild) {
			const realtimeScene = this._kayo.project.currentScene.getRepresentation(this) as SceneRealtimeRepresentation;
			if (!realtimeScene) {
				console.error(`Scene does not have a representation for ${this}`);
				return;
			}
			realtimeScene.updateConfig(this._configCache);
		}
		if (needsContextReconfiguration) this.reconfigureContext(this._configCache);

		viewport.updateView(this.viewUBO, this.frame);

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
			this._configCache,
		);

		const w = viewport.getCurrentTexture().width;
		const h = viewport.getCurrentTexture().height;

		const commandEncoder = this.gpuDevice.createCommandEncoder();
		const r3renderPassEncoder = commandEncoder.beginRenderPass(this.r3renderPassDescriptor);
		r3renderPassEncoder.setViewport(0, 0, w, h, 0, 1);

		const realtimeScene = this._kayo.project.currentScene.getRepresentation(this) as
			| SceneRealtimeRepresentation
			| undefined;
		if (!realtimeScene) return;

		if (realtimeScene.background)
			realtimeScene.background.recordForwardRendering(r3renderPassEncoder);

		for (const categroy of realtimeScene.realtimeRepresentations.values()) {
			for (const o of categroy) {
				o.recordForwardRendering(r3renderPassEncoder);
			}
		}

		r3renderPassEncoder.end();

		viewportCache.resolvePerformanceQueryCommand(commandEncoder);
		this.gpuDevice.queue.submit([commandEncoder.finish()]);
		viewportCache.asyncGPUPerformanceUpdate(performance.now() - start);

		this.frame++;
	}

	public registerViewport(viewport: UI3DViewport) {
		if (this.registeredViewports.has(viewport)) return;

		this.registeredViewports.add(viewport);
		this.viewportCache.set(viewport, new RealtimeViewportCache(this._kayo, viewport, this.createConfigObject(this._kayo.project.currentTime)));
	}

	public unregisterViewport(viewport: UI3DViewport) {
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

	public get config() {
		return this._config;
	}

	public get representationConeceptID() {
		return "realtime rendering";
	}

	public static getRenderingFragmentTargetsFromConfig(bitDepth: 8 | 16, gpux: GPUX): GPUColorTargetState[] {
		return [{ format: gpux.getSwapChainFormat(bitDepth) }, { format: "r16uint" }];
	}

	public static getColorFormats(bitDepth: 8 | 16, gpux: GPUX): GPUTextureFormat[] {
		return [gpux.getSwapChainFormat(bitDepth), "r16uint"];
	}

	public static getConstantsFromConfig(config: RealtimeConfigObject): Record<string, number> | undefined {
		return {
			output_color_space: config.colorSpace == "srgb" ? 0 : 1,
			use_color_quantisation: config.useCustomColorQuantization ? 1 : 0,
			use_dithering: config.useDithering ? 1 : 0,
			output_component_transfere: 1,
		};
	}

	public get rendererKey() {
		return this._config.configKey;
	}

	public createConfigObject(currentTime: KayoNumber): RealtimeConfigObject {
		const general = this._config.general;
		const specific = this._config.specific as RealtimeSpecificRenderConfig;
		return {
			bitDepth: general.swapChain.bitDepthEnum.getKeyByIndex(general.swapChain.bitDepth.sample(currentTime)) as 8 | 16,
			toneMappingMode: general.swapChain.toneMappingModeEnum.getKeyByIndex(general.swapChain.toneMappingMode.sample(currentTime)) as GPUCanvasToneMappingMode,
			colorSpace: general.swapChain.colorSpaceEnum.getKeyByIndex(general.swapChain.colorSpace.sample(currentTime)) as PredefinedColorSpace,
			useCustomColorQuantization: general.customColorQuantisation.useCustomColorQuantization.sample(currentTime),
			useDithering: general.customColorQuantisation.useDithering.sample(currentTime),
			msaa: specific.antialiasing.msaaEnum.getKeyByIndex(specific.antialiasing.msaa.sample(currentTime)) as 1 | 4,
		}
	}

	public createSceneRepresentation(scene: Scene, currentTime: KayoNumber): SceneRealtimeRepresentation {
		return new SceneRealtimeRepresentation(this._kayo, this, scene, currentTime);
	}
}

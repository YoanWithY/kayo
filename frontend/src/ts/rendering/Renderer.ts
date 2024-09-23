import { gpuDevice } from "../GPUX";
import { StateVariableChangeCallback } from "../project/StateVariable";
import { Project } from "../project/Project";
import { Viewport } from "./Viewport";
import { ViewportCache } from "./ViewportCache";
import { OutputForwardRenderConfig } from "../project/Config";
import { CompositingPipeline } from "./CompositingPipeline";
import { ResolvePipeline } from "./ResolvePipeline";

export default class Renderer {
	project: Project;
	preRenderFunctions = new Set<{ val: any, f: StateVariableChangeCallback<any> }>();

	private r3renderPassDescriptor: GPURenderPassDescriptor;
	private overlayRenderPassDescriptor: GPURenderPassDescriptor;
	private selectionRenderPassDescriptor: GPURenderPassDescriptor;
	private r16ResolveRenderPassDescriptor: GPURenderPassDescriptor;
	private compositingRenderPassDescriptor: GPURenderPassDescriptor;

	public needsPipleineRebuild = true;
	public needsContextReconfiguration = true;

	private requestedAnimationFrame = false;
	private viewportsToUpdate = new Set<Viewport>();
	private registeredViewports = new Set<Viewport>();
	private viewportCache = new Map<Viewport, ViewportCache>();
	private viewUBO: GPUBuffer;
	private bindGroup0: GPUBindGroup;
	bindGroup0Layout: GPUBindGroupLayout;
	bindGroupR3Layout: GPUBindGroupLayout;

	compositingPipeline!: CompositingPipeline;
	compositingBindGroupLayout: GPUBindGroupLayout;

	r16ResolvePipeline!: ResolvePipeline;
	r16ResolveBindGroupLayout: GPUBindGroupLayout;
	heightFieldComputePassDescriptor: GPUComputePassDescriptor;


	constructor(project: Project) {
		this.project = project;
		this.reconfigureContext();
		this.viewUBO = gpuDevice.createBuffer({
			label: "View UBO",
			size: (3 * 16 + 12) * 4,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
		});
		this.bindGroup0Layout = gpuDevice.createBindGroupLayout({
			label: "Global default bind group 0 layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
					buffer: {
						type: "uniform",
					}
				},
			]
		});
		this.bindGroupR3Layout = gpuDevice.createBindGroupLayout({
			label: "Default R3 bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer: {
						type: "uniform",
					}
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "uniform",
					}
				},
			]
		});
		this.compositingBindGroupLayout = gpuDevice.createBindGroupLayout({
			label: "Compositing bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "unfilterable-float",
						multisampled: false,
						viewDimension: "2d"
					}
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "uint",
						multisampled: false,
						viewDimension: "2d"
					}
				},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "uint",
						multisampled: false,
						viewDimension: "2d"
					}
				},
			]
		});
		this.r16ResolveBindGroupLayout = gpuDevice.createBindGroupLayout({
			label: "R16u resolve bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "uint",
						multisampled: true,
						viewDimension: "2d"
					}
				},
			]
		});
		this.bindGroup0 = gpuDevice.createBindGroup({
			label: "Global default bind group 0",
			entries: [
				{ binding: 0, resource: { buffer: this.viewUBO } }
			],
			layout: this.bindGroup0Layout,
		});
		this.r3renderPassDescriptor = {
			label: "Render Pass",
			colorAttachments: [
				{
					loadOp: "clear",
					storeOp: "store",
					clearValue: [0.1, 0.1, 0.1, 1],
					view: null as unknown as GPUTextureView,
				},
				{
					loadOp: "clear",
					storeOp: "store",
					clearValue: [0, 0, 0, 0],
					view: null as unknown as GPUTextureView,
				}
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
				endOfPassWriteIndex: 1
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
				}
			],
			timestampWrites: {
				querySet: null as unknown as GPUQuerySet,
				beginningOfPassWriteIndex: 2,
				endOfPassWriteIndex: 3
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
				}
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
				endOfPassWriteIndex: 5
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
				}
			],
			depthStencilAttachment: {
				depthLoadOp: "load",
				depthStoreOp: "discard",
				view: null as unknown as GPUTextureView,
			},
			timestampWrites: {
				querySet: null as unknown as GPUQuerySet,
				beginningOfPassWriteIndex: 6,
				endOfPassWriteIndex: 7
			},
		}
		this.compositingRenderPassDescriptor = {
			label: "Overlay Render Pass",
			colorAttachments: [
				{
					loadOp: "load",
					storeOp: "store",
					view: null as unknown as GPUTextureView,
				}
			],
			timestampWrites: {
				querySet: null as unknown as GPUQuerySet,
				beginningOfPassWriteIndex: 8,
				endOfPassWriteIndex: 9
			},
		};
		this.heightFieldComputePassDescriptor = {
			label: "height field compute pass"
		}
	}

	reconfigureContext() {
		for (const [, viewportCache] of this.viewportCache) {
			viewportCache.reconfigureContext();
		}
		this.needsContextReconfiguration = false;
	}

	rebuildDisplayOutputPipelines() {
		const outConsts = this.project.getDisplayFragmentOutputConstants();
		const format = this.project.getSwapChainFormat();
		const msaa = (this.project.config.output.render as OutputForwardRenderConfig).msaa;
		for (const hf of this.project.scene.heightFieldObjects) {
			hf.pipeline.fragmentConstants["targetColorSpace"] = outConsts["targetColorSpace"];
			hf.pipeline.fragmentConstants["componentTranfere"] = outConsts["componentTranfere"];
			hf.pipeline.fragmentTargets[0].format = format;
			hf.pipeline.multisample.count = msaa;
			hf.pipeline.buildPipeline();
		}
		const gp = this.project.scene.gridPipeline
		if (gp) {
			gp.multisample.count = msaa;
			gp.buildPipeline();
		}
		this.compositingPipeline.fragmentTargets[0].format = format;
		this.compositingPipeline.buildPipeline();
		this.needsPipleineRebuild = false;
	}

	init() {
		this.compositingPipeline = new CompositingPipeline(this.project, "Compositing Pipeline");
		this.r16ResolvePipeline = new ResolvePipeline(this.project, "R16u resolve pipeline", "r16uint", "u32", "x");
	}

	jsTime = "";
	frame = 0;
	loop = () => {
		const start = performance.now();
		this.requestedAnimationFrame = false;
		for (const o of this.preRenderFunctions)
			o.f(o.val);

		this.preRenderFunctions.clear();

		if (this.needsContextReconfiguration)
			this.reconfigureContext();

		if (this.needsPipleineRebuild)
			this.rebuildDisplayOutputPipelines();

		for (const viewport of this.viewportsToUpdate) {
			viewport.updateView(this.viewUBO, this.frame);
			if (viewport.canvasContext && viewport.canvasContext.canvas.width === 0 && viewport.canvasContext.canvas.height === 0) {
				continue;
			}
			const viewportCache = this.viewportCache.get(viewport);
			if (!viewportCache) {
				console.error("Could not find viewport cache.");
				continue;
			}
			const commandEncoder = gpuDevice.createCommandEncoder();
			const config = this.project.config.output.render as OutputForwardRenderConfig;
			viewportCache.setupRenderPasses(
				this.r3renderPassDescriptor,
				this.r16ResolveRenderPassDescriptor,
				this.selectionRenderPassDescriptor,
				this.overlayRenderPassDescriptor,
				this.compositingRenderPassDescriptor,
				config);

			const w = viewport.getCurrentTexture().width;
			const h = viewport.getCurrentTexture().height;

			const heightFieldComputeEncoder = commandEncoder.beginComputePass(this.heightFieldComputePassDescriptor);
			heightFieldComputeEncoder.setBindGroup(0, this.bindGroup0);
			for (const hf of this.project.scene.heightFieldObjects) {
				hf.compute(heightFieldComputeEncoder);
			}
			heightFieldComputeEncoder.end();

			const r3renderPassEncoder = commandEncoder.beginRenderPass(this.r3renderPassDescriptor);
			r3renderPassEncoder.setViewport(0, 0, w, h, 0, 1);
			r3renderPassEncoder.setBindGroup(0, this.bindGroup0);
			for (const hf of this.project.scene.heightFieldObjects) {
				hf.render(r3renderPassEncoder);
			}
			r3renderPassEncoder.end();

			if (viewport.useOverlays) {
				if (config.msaa > 1) {
					const r16ResolveRenderPassEncode = commandEncoder.beginRenderPass(this.r16ResolveRenderPassDescriptor);
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
					if (hf.isActive || hf.isSelected)
						hf.renderSelection(selectionRenderPassEncoder);
				}
				selectionRenderPassEncoder.end();


				const overlayRenderPassEncoder = commandEncoder.beginRenderPass(this.overlayRenderPassDescriptor);
				overlayRenderPassEncoder.setViewport(0, 0, w, h, 0, 1);
				overlayRenderPassEncoder.setBindGroup(0, this.bindGroup0);
				if (this.project.scene.gridPipeline) {
					overlayRenderPassEncoder.setPipeline(this.project.scene.gridPipeline.gpuPipeline);
					overlayRenderPassEncoder.draw(4, 2);
				}
				overlayRenderPassEncoder.end();

				const compositingRenderPassEncoder = commandEncoder.beginRenderPass(this.compositingRenderPassDescriptor);
				compositingRenderPassEncoder.setViewport(0, 0, w, h, 0, 1);
				compositingRenderPassEncoder.setBindGroup(0, viewportCache.compositingBindGroup0);
				compositingRenderPassEncoder.setPipeline(this.compositingPipeline.gpuPipeline);
				compositingRenderPassEncoder.draw(4);
				compositingRenderPassEncoder.end();

			}

			viewportCache.resolvePerformanceQueryCommand(commandEncoder);
			gpuDevice.queue.submit([commandEncoder.finish()]);
			viewportCache.asyncGPUPerformanceUpdate();
		}

		this.jsTime = `${(performance.now() - start).toFixed(3)}ms`;
		this.setPerf();
		this.viewportsToUpdate.clear();
		this.frame++;
	}

	setPerf() {
		this.project.uiRoot.footer.perf.textContent = `Performance: JS: ${this.jsTime}`;
	}

	requestAnimationFrameWith(viewport: Viewport) {
		if (!this.registeredViewports.has(viewport)) {
			console.warn("Viewport is not registered.");
			return;
		}
		this.viewportsToUpdate.add(viewport);
		if (this.requestedAnimationFrame)
			return;

		requestAnimationFrame(this.loop);
		this.requestedAnimationFrame = true;
	}

	registerViewport(viewport: Viewport) {
		if (this.registeredViewports.has(viewport))
			return;

		this.registeredViewports.add(viewport);
		this.viewportCache.set(viewport, new ViewportCache(this.project, viewport));
	}

	unregisterViewport(viewport: Viewport) {
		if (!this.registeredViewports.has(viewport))
			return;

		this.registeredViewports.delete(viewport);
		const cache = this.viewportCache.get(viewport);
		if (cache)
			cache.destroy();
		this.viewportCache.delete(viewport);
	}

	getNew3RData(): { vertexUniformBuffer: GPUBuffer, fragmentUniformBuffer: GPUBuffer, bindGroup: GPUBindGroup } {
		const vertexUniformBuffer = gpuDevice.createBuffer({
			label: "R3 default vertex uniforms buffer",
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
			size: 16 * 4
		});
		const fragmentUniformBuffer = gpuDevice.createBuffer({
			label: "R3 default fragment uniforms buffer",
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
			size: 4 * 4
		});
		const bindGroup = gpuDevice.createBindGroup({
			label: "R3 Bind Group",
			entries: [
				{
					binding: 0,
					resource:
					{
						label: "R3 bind group vertex uniform resource",
						buffer: vertexUniformBuffer
					}
				},
				{
					binding: 1,
					resource:
					{
						label: "R3 bind group fragment uniform resource",
						buffer: fragmentUniformBuffer
					}
				}
			],
			layout: this.bindGroupR3Layout,
		});
		return { vertexUniformBuffer, fragmentUniformBuffer, bindGroup };
	}

	static getDepthStencilFormat(): GPUTextureFormat {
		return "depth24plus";
	}
}
import { gpuDevice } from "../GPUX";
import { StateVariableChangeCallback } from "../project/StateVariable";
import { Project } from "../project/Project";
import { Viewport } from "./Viewport";
import { ViewportCache } from "./ViewportCache";
import { OutputForwardRenderConfig } from "../project/Config";

export default class Renderer {
	project: Project;
	preRenderFunctions = new Set<{ val: any, f: StateVariableChangeCallback<any> }>();

	private renderPassDescriptor: GPURenderPassDescriptor;

	public needsPipleineRebuild = true;
	public needsContextReconfiguration = true;

	private requestedAnimationFrame = false;
	private viewportsToUpdate = new Set<Viewport>();
	private registeredViewports = new Set<Viewport>();
	private viewportCache = new Map<Viewport, ViewportCache>;
	private viewUBO: GPUBuffer;
	private bindGroup0: GPUBindGroup;
	bindGroup0Layout: GPUBindGroupLayout;
	bindGroupR3Layout: GPUBindGroupLayout;

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
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
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
		this.bindGroup0 = gpuDevice.createBindGroup({
			label: "Global default bind group 0",
			entries: [
				{ binding: 0, resource: { buffer: this.viewUBO } }
			],
			layout: this.bindGroup0Layout,
		});
		this.renderPassDescriptor = {
			label: "Render Pass",
			colorAttachments: [
				{
					loadOp: "clear",
					storeOp: "store",
					clearValue: [0.1, 0.1, 0.1, 1],
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
	}

	reconfigureContext() {
		for (const [, viewportCache] of this.viewportCache) {
			viewportCache.reconfigureContext();
		}
		this.needsContextReconfiguration = false;
	}

	rebuildDisplayOutputPipelines() {
		const outConsts = this.project.getDisplayFragmentOutputConstantsCopy();
		const format = this.project.bitDepthToSwapChainFormat();
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
			gp.fragmentConstants["targetColorSpace"] = outConsts["targetColorSpace"];
			gp.fragmentConstants["componentTranfere"] = outConsts["componentTranfere"];
			gp.fragmentTargets[0].format = format;
			gp.multisample.count = msaa;
			gp.buildPipeline();
		}
		this.needsPipleineRebuild = false;
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
			viewportCache.setupRenderPass(this.renderPassDescriptor, (this.project.config.output.render as OutputForwardRenderConfig).msaa);
			const renderPassEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor);
			renderPassEncoder.setBindGroup(0, this.bindGroup0);
			renderPassEncoder.setViewport(0, 0, viewport.getCurrentTexture().width, viewport.getCurrentTexture().height, 0, 1);
			for (const hf of this.project.scene.heightFieldObjects) {
				renderPassEncoder.setPipeline(hf.pipeline.gpuPipeline);
				hf.transformationStack.rotate.x += 0.01;
				hf.updateUniforms();
				renderPassEncoder.setBindGroup(1, hf.defaultBindGroup);
				renderPassEncoder.draw(hf.getVerts());
			}
			if (this.project.scene.gridPipeline) {
				renderPassEncoder.setPipeline(this.project.scene.gridPipeline.gpuPipeline);
				renderPassEncoder.draw(4, 2);
			}
			renderPassEncoder.end();
			viewportCache.resolvePerformanceQueryCommand(commandEncoder);
			gpuDevice.queue.submit([commandEncoder.finish()]);
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
			size: 1 * 4
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
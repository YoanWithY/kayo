import { gpuDevice } from "../GPUX";
import { StateVariableChangeCallback } from "../project/StateVariable";
import { openProject } from "../project/Project";
import { Viewport } from "./Viewport";
import { bitDepthToSwapChainFormat, ViewportCache } from "./ViewportCache";

export default class Renderer {
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

	constructor() {
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
		const outConsts = Renderer.getDisplayFragmentOutputConstantsCopy();
		const format = bitDepthToSwapChainFormat(openProject.config.output.display.swapChainBitDepth);
		for (const hf of openProject.scene.heightFieldObjects) {
			hf.pipeline.fragmentConstants["targetColorSpace"] = outConsts["targetColorSpace"];
			hf.pipeline.fragmentConstants["componentTranfere"] = outConsts["componentTranfere"];
			hf.pipeline.fragmentTargets[0].format = format;
			hf.pipeline.buildPipeline();
		}
		const gp = openProject.scene.gridPipeline
		if (gp) {
			gp.fragmentConstants["targetColorSpace"] = outConsts["targetColorSpace"];
			gp.fragmentConstants["componentTranfere"] = outConsts["componentTranfere"];
			gp.fragmentTargets[0].format = format;
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
			viewportCache.setupRenderPass(this.renderPassDescriptor);
			const renderPassEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor);
			renderPassEncoder.setBindGroup(0, this.bindGroup0);
			renderPassEncoder.setViewport(0, 0, viewport.getCurrentTexture().width, viewport.getCurrentTexture().height, 0, 1);
			for (const hf of openProject.scene.heightFieldObjects) {
				renderPassEncoder.setPipeline(hf.pipeline.gpuPipeline);
				renderPassEncoder.draw(hf.getVerts());
			}
			if (openProject.scene.gridPipeline) {
				renderPassEncoder.setPipeline(openProject.scene.gridPipeline.gpuPipeline);
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
		openProject.uiRoot.footer.perf.textContent = `Performance: JS: ${this.jsTime}`;
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
		this.viewportCache.set(viewport, new ViewportCache(viewport));
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

	static getDisplayFragmentOutputConstantsCopy(): Record<string, number> {
		return {
			targetColorSpace: openProject.config.output.display.swapChainColorSpace == "srgb" ? 0 : 1,
			componentTranfere: openProject.config.output.render.mode === "deferred" ? 0 : 1,
		};
	}

	static getFragmentTargets(): GPUColorTargetState[] {
		return [
			{
				format: bitDepthToSwapChainFormat(openProject.config.output.display.swapChainBitDepth)
			}];
	}

	static getDepthStencilFormat(): GPUTextureFormat {
		return "depth24plus";
	}
}
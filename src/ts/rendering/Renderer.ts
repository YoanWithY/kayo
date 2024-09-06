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

	constructor() {
		this.reconfigureContext();

		this.renderPassDescriptor = {
			label: "Render Pass",
			colorAttachments: [
				{
					loadOp: "clear",
					storeOp: "store",
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
			hf.material.fragmentConstants["targetColorSpace"] = outConsts["targetColorSpace"];
			hf.material.fragmentConstants["componentTranfere"] = outConsts["componentTranfere"];
			hf.material.fragmentTargets[0].format = format;
			hf.material.buildPipeline();
		}
		this.needsPipleineRebuild = false;
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

	gpuTime = "";
	jsTime = "";
	loop = () => {
		const start = performance.now();
		this.requestedAnimationFrame = false;
		for (const o of this.preRenderFunctions) {
			o.f(o.val);
		}
		this.preRenderFunctions.clear();

		if (this.needsContextReconfiguration)
			this.reconfigureContext();

		if (this.needsPipleineRebuild)
			this.rebuildDisplayOutputPipelines();

		const commandEncoder = gpuDevice.createCommandEncoder();
		for (const viewport of this.viewportsToUpdate) {
			const viewportCache = this.viewportCache.get(viewport);
			if (!viewportCache) {
				console.error("Could not find viewport cache.");
				continue;
			}

			viewportCache.setupRenderPass(this.renderPassDescriptor);
			const renderPassEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor);

			renderPassEncoder.setViewport(0, 0, viewport.getCurrentTexture().width, viewport.getCurrentTexture().height, 0, 1);
			for (const hf of openProject.scene.heightFieldObjects) {
				renderPassEncoder.setPipeline(hf.material.pipeline);
				renderPassEncoder.draw(hf.getVerts());
			}
			renderPassEncoder.end();
			viewportCache.resolvePerformanceQueryCommand(commandEncoder);
		}

		gpuDevice.queue.submit([commandEncoder.finish()]);

		this.jsTime = `${(performance.now() - start).toFixed(3)}ms`;
		this.setPerf();
		this.viewportsToUpdate.clear();
	}

	setPerf() {
		openProject.uiRoot.footer.perf.textContent = `Performance: JS: ${this.jsTime} | GPU: ${this.gpuTime} `;
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
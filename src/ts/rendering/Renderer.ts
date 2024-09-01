import { gpu, gpuCanvas, gpuContext, gpuDevice } from "../GPUX";
import { SplitPaneDivider } from "../ui/splitpane/SplitPaneDivider";
import { StateVariableChangeCallback } from "../project/StateVariable";
import { getElement } from "./RenderUtil";
import { ViewportPane } from "../ui/panes/ViewportPane";
import { SwapChainBitDepth } from "../project/Config";
import { openProject } from "../project/Project";

export default class Renderer {
	preRenderFunctions = new Set<{ val: any, f: StateVariableChangeCallback<any> }>();

	clearColor = SplitPaneDivider.getColor();

	clearRenderPassDescriptor: GPURenderPassDescriptor;
	renderPassDescriptor: GPURenderPassDescriptor;

	needsPipleineRebuild = true;
	needsContextReconfiguration = false;

	depthTexture!: GPUTexture;
	prevCanvasWidth = -1;
	prevCanvasHeight = -1;
	depthView: GPUTextureView;

	constructor() {
		this.reconfigureContext();


		this.renderPassDescriptor = {
			colorAttachments: [
				{
					loadOp: "clear",
					storeOp: "store",
					view: gpuContext.getCurrentTexture().createView(),
				}
			],
			depthStencilAttachment: {
				depthClearValue: 1.0,
				depthStoreOp: "store",
				depthLoadOp: "clear",
				view: gpuDevice.createTexture({
					size: [4, 4, 1],
					format: 'depth24plus',
					usage: GPUTextureUsage.RENDER_ATTACHMENT,
					label: "Render Depth Attachment",
				}).createView(),
			},
			label: "Render Pass"
		};

		this.recreateDepthTexture();
		this.depthView = this.depthTexture.createView();


		this.clearRenderPassDescriptor = {
			colorAttachments: [
				{
					clearValue: { r: this.clearColor[0] / 255, g: this.clearColor[1] / 255, b: this.clearColor[2] / 255, a: 1 },
					loadOp: "clear",
					storeOp: "store",
					view: gpuContext.getCurrentTexture().createView(),
				}
			],
			label: "Clear Render Pass"
		};
	}

	reconfigureContext() {
		gpuContext.unconfigure();
		gpuContext.configure({
			device: gpuDevice,
			format: bitDepthToSwapChainFormat(openProject.config.output.display.swapChainBitDepth),
			alphaMode: "opaque",
			colorSpace: openProject.config.output.display.swapChainColorSpace,
			toneMapping: { mode: openProject.config.output.display.swapChainToneMappingMode },
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});
		this.needsContextReconfiguration = false;
		console.log("reg context");
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
		console.log("reb pipeline");

	}

	recreateDepthTexture() {
		const w = gpuContext.getCurrentTexture().width;
		const h = gpuContext.getCurrentTexture().height;
		if (this.depthTexture)
			this.depthTexture.destroy();

		this.depthTexture = gpuDevice.createTexture({
			size: [w, h, 1],
			format: 'depth24plus',
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			label: "Render Depth Attachment",
		});
		this.prevCanvasWidth = w;
		this.prevCanvasHeight = h;

		const depthAttachment = this.renderPassDescriptor.depthStencilAttachment;
		if (!depthAttachment) {
			console.error("Could not get depth attachment.");
			return;
		}
		this.depthView = this.depthTexture.createView();
		depthAttachment.view = this.depthView;
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

	loop = () => {
		for (const o of this.preRenderFunctions) {
			o.f(o.val);
		}
		this.preRenderFunctions.clear();

		if (this.needsContextReconfiguration)
			this.reconfigureContext();

		if (this.needsPipleineRebuild)
			this.rebuildDisplayOutputPipelines();

		if (gpuContext.getCurrentTexture().width !== this.prevCanvasWidth || gpuContext.getCurrentTexture().height !== this.prevCanvasHeight) {
			this.recreateDepthTexture();
		}

		const gpuCommandEncoder = gpuDevice.createCommandEncoder();

		const currentView = gpuContext.getCurrentTexture().createView();
		const clearRenderAttachment = getElement(this.clearRenderPassDescriptor.colorAttachments, 0);
		if (!clearRenderAttachment) {
			console.error("Could not get attachment.");
			return;
		}
		clearRenderAttachment.clearValue = { r: 0, g: 0, b: 0, a: 1 };
		clearRenderAttachment.view = currentView;

		const gpuClearRenderPassEncode = gpuCommandEncoder.beginRenderPass(this.clearRenderPassDescriptor);
		gpuClearRenderPassEncode.end();

		const renderAttachment = getElement(this.renderPassDescriptor.colorAttachments, 0);
		if (!renderAttachment) {
			console.error("Could not get attachment.");
			return;
		}
		renderAttachment.view = currentView;

		for (const viewportPane of ViewportPane.viewports) {
			const viewRect = viewportPane.getViewport();

			const clippedRect = clippRect(viewRect, gpuCanvas.width, gpuCanvas.height);

			const gpuRenderPassEncoder = gpuCommandEncoder.beginRenderPass(this.renderPassDescriptor);
			gpuRenderPassEncoder.setViewport(viewRect.left, viewRect.top, clippedRect.w, clippedRect.h, 0, 1);
			for (const hf of openProject.scene.heightFieldObjects) {
				gpuRenderPassEncoder.setPipeline(hf.material.pipeline);
				gpuRenderPassEncoder.draw(hf.getVerts());
			}
			gpuRenderPassEncoder.end();
		}

		gpuDevice.queue.submit([gpuCommandEncoder.finish()]);

		// const deltaT = t - lastFrame;
		// p.textContent = `${deltaT}`;
		// lastFrame = t;

		requestAnimationFrame(this.loop);
	}
}

export function bitDepthToSwapChainFormat(bpc: SwapChainBitDepth): GPUTextureFormat {
	if (bpc === "8bpc")
		return gpu.getPreferredCanvasFormat();
	return "rgba16float";
}

function clippRect(viewRect: { left: number, top: number, width: number, height: number }, targetWidth: number, targetHeight: number) {
	const right = viewRect.left + viewRect.width;
	const bottom = viewRect.top + viewRect.height;
	const w = right > targetWidth ? targetWidth - viewRect.left : viewRect.width;
	const h = bottom > targetHeight ? targetHeight - viewRect.top : viewRect.height;
	return { w, h }
}
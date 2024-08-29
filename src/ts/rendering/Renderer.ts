import { gpuContext, gpuDevice } from "../GPUX";
import { createBindGroup, createSampler, loadImageTexture, resolveIncludes } from "./Shader";
import shaderCode from "../../wgsl/shader.wgsl?raw";
import { SplitPaneDivider } from "../ui/splitpane/SplitPaneDivider";
import { StateVariableChangeCallback } from "../project/StateVariable";
import { getElement } from "./RenderUtil";
import { ViewportPane } from "../ui/panes/ViewportPane";
import { bitDepthToSwapChainFormat } from "../project/Config";
import { openProject } from "../project/Project";

const vertices = new Float32Array([
	-1, 1, 0, 1,
	1, 0, 0, 1,

	-1, -1, 0, 1,
	0, 1, 0, 1,

	1, 1, 0, 1,
	0, 0, 1, 1,

	1, -1, 0, 1,
	1, 1, 1, 1,
]);

const texture = await loadImageTexture(gpuDevice, 'untitled color.png');

let lastFrame = 0;

export default class Renderer {
	preRenderFunctions = new Set<{ val: any, f: StateVariableChangeCallback<any> }>();

	shaderModule = gpuDevice.createShaderModule({
		code: resolveIncludes(shaderCode),
		label: "Combined shader module"
	});

	vertexBuffer: GPUBuffer = gpuDevice.createBuffer({
		size: vertices.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
	});

	vertexBufferLayouts: GPUVertexBufferLayout[] = [
		{
			attributes: [
				{
					shaderLocation: 0,
					offset: 0,
					format: "float32x4",
				},
				{
					shaderLocation: 1,
					offset: 16,
					format: "float32x4",
				}
			],
			arrayStride: 32,
			stepMode: "vertex"
		}
	];

	sampler = createSampler(gpuDevice);
	bindGroup: GPUBindGroup;
	bindGroupLayout: GPUBindGroupLayout;
	renderPipelineDescriptor: GPURenderPipelineDescriptor;

	clearColor = SplitPaneDivider.getColor();

	clearRenderPassDescriptor: GPURenderPassDescriptor;
	renderPassDescriptor: GPURenderPassDescriptor;

	renderPipeline: GPURenderPipeline;

	reconfigureContext() {
		gpuContext.unconfigure();
		gpuContext.configure({
			device: gpuDevice,
			format: bitDepthToSwapChainFormat(openProject.config.output.display.swapChainBitDepth),
			alphaMode: "opaque",
			colorSpace: openProject.config.output.display.swapChainColorSpace,
			toneMapping: { mode: openProject.config.output.display.swapChainToneMappingMode },
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		})
	}

	constructor() {
		this.reconfigureContext();
		gpuDevice.queue.writeBuffer(this.vertexBuffer, 0, vertices, 0, vertices.length);

		const { group: bindGroup, layout: bindGroupLayout } = createBindGroup(gpuDevice, texture, this.sampler);
		this.bindGroup = bindGroup;
		this.bindGroupLayout = bindGroupLayout;

		this.renderPipelineDescriptor = {
			vertex: {
				module: this.shaderModule,
				entryPoint: "vertex_main",
				buffers: this.vertexBufferLayouts
			},
			fragment: {
				module: this.shaderModule,
				entryPoint: "fragment_main",
				targets: [
					{
						format: bitDepthToSwapChainFormat(openProject.config.output.display.swapChainBitDepth)
					}
				],
				constants: {
					targetColorSpace: openProject.config.output.display.swapChainColorSpace == "srgb" ? 0 : 1,
					componentTranfere: openProject.config.output.display.swapChainColorSpace == "srgb" ? 0 : 1,
				}
			},
			primitive: {
				topology: "triangle-strip"
			},
			layout: gpuDevice.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] })
		}

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

		this.renderPassDescriptor = {
			colorAttachments: [
				{
					loadOp: "load",
					storeOp: "store",
					view: gpuContext.getCurrentTexture().createView(),
				}
			],
			label: "Render Pass"
		};

		this.renderPipeline = gpuDevice.createRenderPipeline(this.renderPipelineDescriptor);
	}

	loop = (t: number) => {
		for (const o of this.preRenderFunctions)
			o.f(o.val);
		this.preRenderFunctions.clear();

		requestAnimationFrame(this.loop);
		const gpuCommandEncoder = gpuDevice.createCommandEncoder();

		const clearRenderAttachment = getElement(this.clearRenderPassDescriptor.colorAttachments, 0);
		if (!clearRenderAttachment) {
			console.error("Could not get attachment.");
			return;
		}
		clearRenderAttachment.clearValue = { r: 1, g: 0, b: 0, a: 1 };
		clearRenderAttachment.view = gpuContext.getCurrentTexture().createView();

		const gpuClearRenderPassEncode = gpuCommandEncoder.beginRenderPass(this.clearRenderPassDescriptor);
		gpuClearRenderPassEncode.end();

		for (const viewportPane of ViewportPane.viewports) {
			viewportPane.getViewportAndUpdateAttachmentsIfNecessary();
			const renderAttachment = getElement(this.renderPassDescriptor.colorAttachments, 0);
			if (!renderAttachment) {
				console.error("Could not get attachment.");
				return;
			}
			renderAttachment.view = viewportPane.renderAttachment.createView();

			const viewRect = viewportPane.getViewport();

			const gpuRenderPassEncoder = gpuCommandEncoder.beginRenderPass(this.renderPassDescriptor);
			gpuRenderPassEncoder.setViewport(0, 0, viewRect.width, viewRect.height, 0, 1);
			gpuRenderPassEncoder.setPipeline(this.renderPipeline);
			gpuRenderPassEncoder.setBindGroup(0, this.bindGroup);
			gpuRenderPassEncoder.setVertexBuffer(0, this.vertexBuffer);
			gpuRenderPassEncoder.draw(4);
			gpuRenderPassEncoder.end();
		}

		gpuDevice.queue.submit([gpuCommandEncoder.finish()]);

		// const deltaT = t - lastFrame;
		// p.textContent = `${deltaT}`;
		lastFrame = t;
	}
}
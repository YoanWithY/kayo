import { ViewportPane } from "../ui/ViewportPane";
import { gpuContext } from "./canvasInit";
import Config from "./Config";
import { gpuDevice } from "./gpuInit";
import { getElement } from "./RenderUtil";
import shaderCode from "../../wgsl/shader.wgsl?raw";

const shaderModule = gpuDevice.createShaderModule({
	code: shaderCode
});

const vertices = new Float32Array([
	-1, 1, 0, 1,
	0, 0, 0, 1,

	-1, -1, 0, 1,
	0, 0, 0, 1,

	1, 1, 0, 1,
	1, 0, 0, 1,

	1, -1, 0, 1,
	1, 0, 0, 1,
]);

const vertexBuffer: GPUBuffer = gpuDevice.createBuffer({
	size: vertices.byteLength,
	usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

gpuDevice.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);

const vertexBuffers: GPUVertexBufferLayout[] = [
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

const renderPipelineDescriptor: GPURenderPipelineDescriptor = {
	vertex: {
		module: shaderModule,
		entryPoint: "vertex_main",
		buffers: vertexBuffers
	},
	fragment: {
		module: shaderModule,
		entryPoint: "fragment_main",
		targets: [
			{
				format: Config.swapChainFormat
			}
		]
	},
	primitive: {
		topology: "triangle-strip"
	},
	layout: "auto"
}

const renderPipeline: GPURenderPipeline = gpuDevice.createRenderPipeline(renderPipelineDescriptor);

const clearRenderPassDescriptor: GPURenderPassDescriptor = {
	colorAttachments: [
		{
			clearValue: { r: 0.0784313725, g: 0.0784313725, b: 0.0784313725, a: 1 },
			loadOp: "clear",
			storeOp: "store",
			view: gpuContext.getCurrentTexture().createView(),
		}
	],
	label: "Clear Render Pass"

};

const renderPassDescriptor: GPURenderPassDescriptor = {
	colorAttachments: [
		{
			clearValue: { r: 0, g: 0.5, b: 1, a: 1 },
			loadOp: "clear",
			storeOp: "store",
			view: gpuContext.getCurrentTexture().createView(),
		}
	],
	label: "Render Pass"
};

let lastFrame = 0;
const p = document.getElementById("fps") as HTMLSpanElement;

export function loop(t: number) {
	requestAnimationFrame(loop);
	const canvasRenderTexture = gpuContext.getCurrentTexture();
	const gpuCommandEncoder = gpuDevice.createCommandEncoder();

	const clearRenderAttachment = getElement(clearRenderPassDescriptor.colorAttachments, 0);
	if (!clearRenderAttachment) {
		console.error("Could not get attachment.");
		return;
	}
	clearRenderAttachment.view = gpuContext.getCurrentTexture().createView();

	const gpuClearRenderPassEncode = gpuCommandEncoder.beginRenderPass(clearRenderPassDescriptor);
	gpuClearRenderPassEncode.end();

	for (const viewportPane of ViewportPane.viewports) {
		viewportPane.getViewportAndUpdateAttachmentsIfNecessary();
		const renderAttachment = getElement(renderPassDescriptor.colorAttachments, 0);
		if (!renderAttachment) {
			console.error("Could not get attachment.");
			return;
		}
		renderAttachment.clearValue = { r: 0.2, g: 0.2, b: 0.2, a: 1 };
		renderAttachment.view = viewportPane.renderAttachment.createView();


		const viewRect = viewportPane.getViewport();

		const gpuRenderPassEncoder = gpuCommandEncoder.beginRenderPass(renderPassDescriptor);
		gpuRenderPassEncoder.setViewport(0, 0, viewRect.width, viewRect.height, 0, 1);
		gpuRenderPassEncoder.setPipeline(renderPipeline);
		gpuRenderPassEncoder.setVertexBuffer(0, vertexBuffer);
		gpuRenderPassEncoder.draw(4);
		gpuRenderPassEncoder.end();
		gpuCommandEncoder.copyTextureToTexture(
			{
				texture: viewportPane.renderAttachment
			},
			{
				texture: gpuContext.getCurrentTexture(),
				origin: [viewRect.left, viewRect.top, 0],
			},
			{
				width: viewRect.left + viewRect.width > canvasRenderTexture.width ? canvasRenderTexture.width - viewRect.left : viewRect.width,
				height: viewRect.top + viewRect.height > canvasRenderTexture.height ? canvasRenderTexture.height - viewRect.top : viewRect.height,
			}
		);
	}

	gpuDevice.queue.submit([gpuCommandEncoder.finish()]);

	const deltaT = t - lastFrame;
	p.textContent = `${deltaT}`;
	lastFrame = t;
}
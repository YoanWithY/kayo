import { getElement, GPUX } from "../../../../GPUX";
import { Kayo } from "../../../../Kayo";
import { Renderer } from "../../../../Renderer";
import { resolveShader } from "../../../../rendering/ShaderUtils";
import { VirtualTextureSystem } from "../../../../Textures/VirtualTextureSystem";
import { SVTDebugPanel } from "./SVTDebugPanel";
import staticShaderCode from "./svtDebugShader.wgsl?raw";

const shaderCode = staticShaderCode;
const preProzessedShaderCoder = resolveShader(shaderCode);
const primiteState: GPUPrimitiveState = {
	frontFace: "ccw",
	topology: "triangle-strip",
	cullMode: "none",
};
const vertexEntryPoint = "vertex_main";
const fragmentEntryPoint = "fragment_main";

export class SVTDebugRenderer implements Renderer {
	public static readonly rendererKey = "__kayo__svt_debug";
	private _registeredViewports: Set<SVTDebugPanel>;
	private _kayo: Kayo;

	public constructor(kayo: Kayo) {
		this._kayo = kayo;
		this._registeredViewports = new Set();
	}
	public get registeredViewports() {
		return this._registeredViewports;
	}
	public renderViewport(_: number, viewport: SVTDebugPanel): void {
		const start = performance.now();

		const commandEncoder = this._kayo.gpux.gpuDevice.createCommandEncoder();
		const colorAttachment = getElement(
			SVTDebugRenderer._renderPassDescriptor.colorAttachments,
			0,
		) as GPURenderPassColorAttachment;
		colorAttachment.view = viewport.canvasContext.getCurrentTexture();
		const renderPassEncoder = commandEncoder.beginRenderPass(SVTDebugRenderer._renderPassDescriptor);

		renderPassEncoder.setPipeline(SVTDebugRenderer._renderPipeline);
		renderPassEncoder.setBindGroup(0, SVTDebugRenderer._bindGroup);
		renderPassEncoder.draw(4);

		renderPassEncoder.end();
		this._kayo.gpux.gpuDevice.queue.submit([commandEncoder.finish()]);
		const jsTime = performance.now() - start;
		console.log(jsTime);
	}
	public registerViewport(viewport: SVTDebugPanel): void {
		this._registeredViewports.add(viewport);
	}
	public unregisterViewport(viewport: SVTDebugPanel): void {
		this._registeredViewports.delete(viewport);
	}

	private static _renderPassDescriptor: GPURenderPassDescriptor;
	private static _renderPipeline: GPURenderPipeline;
	private static _pipelineLayout: GPUPipelineLayout;
	private static _bindGroup: GPUBindGroup;
	public static init(gpux: GPUX, virtualTextureSystem: VirtualTextureSystem) {
		this._renderPassDescriptor = {
			label: "SVT Debug Renderer - Render Pass",
			colorAttachments: [
				{
					loadOp: "clear",
					storeOp: "store",
					clearValue: [1.0, 0.0, 0.0, 1.0],
					view: null as unknown as GPUTextureView,
				},
			],
		};
		const shaderModule = gpux.gpuDevice.createShaderModule({
			label: "SVT Debug Renderer - Shader Module",
			code: preProzessedShaderCoder,
		});
		const bindGroupLayout = gpux.gpuDevice.createBindGroupLayout({
			label: "SVT Debug Renderer - Bind Group Layout",
			entries: [...VirtualTextureSystem.bindGroupLayoutEntries],
		});
		this._bindGroup = gpux.gpuDevice.createBindGroup({
			label: "SVT Debug Renderer - Bind Group",
			layout: bindGroupLayout,
			entries: [...virtualTextureSystem.bindGroupEntries],
		});
		this._pipelineLayout = gpux.gpuDevice.createPipelineLayout({
			bindGroupLayouts: [bindGroupLayout],
		});
		this._renderPipeline = gpux.gpuDevice.createRenderPipeline({
			label: "SVT Debug Renderer - Render Pipeline",
			vertex: { module: shaderModule, entryPoint: vertexEntryPoint },
			fragment: {
				module: shaderModule,
				entryPoint: fragmentEntryPoint,
				targets: [{ format: gpux.gpu.getPreferredCanvasFormat() }],
			},
			primitive: primiteState,
			layout: this._pipelineLayout,
		});
	}
}

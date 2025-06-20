import { RenderState } from "../../c/KayoCorePP";
import {
	AbstractDisplayOutputRenderingPipeline,
	fragmentEntryPoint,
	vertexEntryPoint,
} from "../Material/AbstractRenderingPipeline";
import Renderable from "../Material/Renderable";
import { Project } from "../project/Project";
import Renderer from "../rendering/Renderer";
import { resolveShader } from "../rendering/ShaderUtils";
import staticShaderCode from "./background.wgsl?raw";

class BackgroundPipeline extends AbstractDisplayOutputRenderingPipeline {
	gpuPipeline: GPURenderPipeline;
	shaderModule: GPUShaderModule;
	vertexConstants: Record<string, number>;
	vertexBufferLayout: GPUVertexBufferLayout[];
	fragmentConstants: Record<string, number>;
	fragmentTargets: GPUColorTargetState[];
	topology: GPUPrimitiveTopology;
	cullMode: GPUCullMode;
	stripIndexFormat?: GPUIndexFormat | undefined;
	depthStencilFormat: GPUTextureFormat;
	depthCompare: GPUCompareFunction;
	depthWriteEnabled: boolean;
	vertexEntryPoint = vertexEntryPoint;
	fragmentEntryPoint = fragmentEntryPoint;
	project: Project;
	shaderCode: string;
	preProzessedShaderCoder: string;

	constructor(project: Project, label: string) {
		super(label);
		this.project = project;
		this.shaderCode = staticShaderCode;
		this.preProzessedShaderCoder = resolveShader(this.shaderCode);
		this.vertexConstants = {};
		this.vertexBufferLayout = [
			{
				arrayStride: 3 * 4,
				attributes: [
					{
						shaderLocation: 0,
						format: "float32x3",
						offset: 0,
					},
				],
				stepMode: "vertex",
			},
		];
		this.fragmentConstants = project.getDisplayFragmentOutputConstants();
		this.topology = "triangle-list";
		this.cullMode = "none";
		this.depthCompare = "always";
		this.depthWriteEnabled = false;
		this.depthStencilFormat = Renderer.getDepthStencilFormat();
		this.fragmentTargets = project.getFragmentTargets(
			(this.project.wasmx.kayoInstance.project.renderStates.get("default") as RenderState).config.general,
		);

		this.shaderModule = this.project.gpux.gpuDevice.createShaderModule({
			label: `${label} shader module`,
			code: this.preProzessedShaderCoder,
			compilationHints: [{ entryPoint: vertexEntryPoint }, { entryPoint: fragmentEntryPoint }],
		});
		this.gpuPipeline = this.buildPipeline(this.project.gpux.gpuDevice);
	}
	createPipelineLayout(): GPUPipelineLayout | "auto" {
		return this.project.gpux.gpuDevice.createPipelineLayout({
			label: "Background Pipeline Layout",
			bindGroupLayouts: [this.project.renderer.bindGroup0Layout],
		});
	}
}

export default class Background implements Renderable {
	pipeline: BackgroundPipeline;
	private static _vertexBuffer: GPUBuffer;
	private static _indexBuffer: GPUBuffer;
	public project: Project;
	public static initBuffers(gpuDevice: GPUDevice) {
		const vertices = [1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1];
		this._vertexBuffer = gpuDevice.createBuffer({
			label: "Background Box vertex buffer",
			size: vertices.length * 4,
			mappedAtCreation: true,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
		});
		new Float32Array(this._vertexBuffer.getMappedRange()).set(vertices);
		this._vertexBuffer.unmap();

		const indices = [
			0, 1, 2, 0, 2, 3, 4, 0, 3, 4, 3, 7, 5, 4, 7, 5, 7, 6, 1, 5, 6, 1, 6, 2, 4, 5, 1, 4, 1, 0, 3, 2, 6, 3, 6, 7,
		];
		this._indexBuffer = gpuDevice.createBuffer({
			label: "Background Box index buffer",
			size: indices.length * 2,
			mappedAtCreation: true,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.INDEX,
		});
		new Uint16Array(this._indexBuffer.getMappedRange()).set(indices);
		this._indexBuffer.unmap();
	}
	constructor(project: Project) {
		this.project = project;
		this.pipeline = new BackgroundPipeline(project, "Background Pipeline");
	}
	recordForwardRendering(renderPassEnoder: GPURenderPassEncoder): void {
		renderPassEnoder.setPipeline(this.pipeline.gpuPipeline);
		renderPassEnoder.setVertexBuffer(0, Background._vertexBuffer);
		renderPassEnoder.setIndexBuffer(Background._indexBuffer, "uint16");
		renderPassEnoder.setBindGroup(0, this.project.renderer.bindGroup0);
		renderPassEnoder.drawIndexed(6 * 2 * 3, 1);
	}
}

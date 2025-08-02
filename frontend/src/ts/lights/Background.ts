import Renderable from "../rendering/Renderable";
import { Project } from "../project/Project";
import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";
import {
	AbstractMetaRenderPipeline,
	PipelineBuildFunction,
	PipelineCache,
	RenderConfigKey,
} from "../rendering/AbstractMetaRenderingPipeline";
import { GPUX } from "../GPUX";
import staticShaderCode from "./background.wgsl?raw";
import { resolveShader } from "../rendering/ShaderUtils";
import RealtimeRenderer from "../rendering/RealtimeRenderer";

const vertexBufferLayout: GPUVertexBufferLayout[] = [
	{
		arrayStride: 12,
		attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }],
	},
];
const preProzessedShaderCoder = resolveShader(staticShaderCode);

class BackgroundPipeline extends AbstractRenderingPipeline {
	protected primiteState: GPUPrimitiveState;
	protected vertexState: GPUVertexState;
	protected fragmentState: GPUFragmentState;
	public constructor(
		label: string,
		shaderModule: GPUShaderModule,
		key: RenderConfigKey,
		gpux: GPUX,
		layout: GPUPipelineLayout,
	) {
		super(label, shaderModule);
		this.primiteState = {
			cullMode: "front",
			frontFace: "ccw",
			topology: "triangle-list",
		};
		const constants = AbstractMetaRenderPipeline.getConstantsFromKey(key);

		this.depthStencilState.depthCompare = "less-equal";

		this.vertexState = {
			module: shaderModule,
			buffers: vertexBufferLayout,
			constants: constants,
			entryPoint: "vertex_main",
		};
		this.fragmentState = {
			module: shaderModule,
			entryPoint: "fragment_main",
			constants: constants,
			targets: AbstractMetaRenderPipeline.getRenderingFragmentTargetsFromKey(key, gpux),
		};

		this.multisample.count = key.msaa;

		this.buildPipeline(gpux.gpuDevice, layout);
	}
}

export default class Background implements Renderable {
	protected pipelineCache: PipelineCache;
	public project: Project;

	public constructor(project: Project) {
		this.project = project;
		this.pipelineCache = new PipelineCache();
		this.pipelineCache.buildFunction = this._pipelineBuildFunction;
	}

	public recordForwardRendering(renderPassEnoder: GPURenderPassEncoder, key: RenderConfigKey): void {
		renderPassEnoder.setPipeline(this.pipelineCache.getPipeline(key).gpuPipeline);
		renderPassEnoder.setVertexBuffer(0, Background._vertexBuffer);
		renderPassEnoder.setIndexBuffer(Background._indexBuffer, "uint16");
		renderPassEnoder.setBindGroup(0, this.project.renderers[RealtimeRenderer.rendererKey].bindGroup0);
		renderPassEnoder.drawIndexed(6 * 2 * 3, 1);
	}

	private _pipelineBuildFunction: PipelineBuildFunction = (key: RenderConfigKey) => {
		return new BackgroundPipeline(
			"background",
			Background.shaderModule,
			key,
			this.project.gpux,
			Background.pipelineLayout,
		);
	};

	public static shaderModule: GPUShaderModule;
	private static _vertexBuffer: GPUBuffer;
	private static _indexBuffer: GPUBuffer;
	public static pipelineLayout: GPUPipelineLayout;
	public static init(gpuDevice: GPUDevice, bindGroup0Layout: GPUBindGroupLayout) {
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

		this.shaderModule = gpuDevice.createShaderModule({
			label: "background",
			code: preProzessedShaderCoder,
		});

		this.pipelineLayout = gpuDevice.createPipelineLayout({
			label: "background",
			bindGroupLayouts: [bindGroup0Layout],
		});
	}
}

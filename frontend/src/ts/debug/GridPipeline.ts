import Renderable from "../rendering/Renderable";
import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";
import {
	AbstractMetaRenderPipeline,
	PipelineBuildFunction,
	PipelineCache,
	RenderPipelineKey,
} from "../rendering/AbstractMetaRenderingPipeline";
import staticShaderCode from "./grid.wgsl?raw";

import { GPUX } from "../GPUX";
import { Project } from "../project/Project";
import { resolveShader } from "../rendering/ShaderUtils";
import RealtimeRenderer from "../rendering/RealtimeRenderer";

const vertexBufferLayout: GPUVertexBufferLayout[] = [
	{
		arrayStride: 2 * 4,
		attributes: [{ shaderLocation: 0, offset: 0, format: "float32x2" }],
	},
];

export class GridPipeline extends AbstractRenderingPipeline {
	protected primiteState: GPUPrimitiveState;
	protected vertexState: GPUVertexState;
	protected fragmentState: GPUFragmentState;
	public static pushRotation(arr: number[], outer: number, inner: number) {
		arr.push(
			-outer,
			-outer,
			-inner,
			-inner,
			-outer,
			outer,
			-inner,
			inner,
			outer,
			outer,
			inner,
			inner,
			outer,
			-outer,
			inner,
			-inner,
			-outer,
			-outer,
			-inner,
			-inner,
		);
	}
	public constructor(
		label: string,
		shaderModule: GPUShaderModule,
		key: RenderPipelineKey,
		gpux: GPUX,
		layout: GPUPipelineLayout,
	) {
		super(label, shaderModule);
		this.primiteState = {
			cullMode: "none",
			frontFace: "ccw",
			topology: "triangle-strip",
		};

		this.depthStencilState.depthCompare = "less";

		const constants = AbstractMetaRenderPipeline.getConstantsFromKey(key);

		this.vertexState = {
			module: shaderModule,
			constants: constants,
			buffers: vertexBufferLayout,
		};

		const targets = AbstractMetaRenderPipeline.getRenderingFragmentTargetsFromKey(key, gpux);
		targets[0].blend = {
			alpha: { srcFactor: "one", operation: "add", dstFactor: "one-minus-src-alpha" },
			color: { srcFactor: "one", operation: "add", dstFactor: "one-minus-src-alpha" },
		};
		targets[1].writeMask = 0;
		this.fragmentState = {
			module: shaderModule,
			targets: targets,
			constants: constants,
		};
		this.multisample.count = key.msaa;
		this.buildPipeline(gpux.gpuDevice, layout);
	}
}

const preProzessedShaderCoder = resolveShader(staticShaderCode);

export class Grid implements Renderable {
	protected pipelineCache: PipelineCache;
	public project: Project;

	public constructor(project: Project) {
		this.project = project;
		this.pipelineCache = new PipelineCache();
		this.pipelineCache.buildFunction = this._pipelineBuildFunction;
	}

	private _pipelineBuildFunction: PipelineBuildFunction = (key: RenderPipelineKey) => {
		return new GridPipeline("Grid", Grid.shaderModule, key, this.project.gpux, Grid.pipelineLayout);
	};

	public static shaderModule: GPUShaderModule;
	public static pipelineLayout: GPUPipelineLayout;
	public static vertexBuffer: GPUBuffer;
	public static vertexData: number[] = [];
	public static init(gpux: GPUX, bindGroup0Layout: GPUBindGroupLayout) {
		GridPipeline.pushRotation(this.vertexData, 10000, 1000);
		GridPipeline.pushRotation(this.vertexData, 1000, 100);
		GridPipeline.pushRotation(this.vertexData, 100, 10);
		this.vertexData.push(-10, -10, -10, 10, 10, -10, 10, 10);

		this.vertexBuffer = gpux.gpuDevice.createBuffer({
			size: this.vertexData.length * 4,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});
		new Float32Array(this.vertexBuffer.getMappedRange()).set(this.vertexData);
		this.vertexBuffer.unmap();

		this.shaderModule = gpux.gpuDevice.createShaderModule({
			label: "grid",
			code: preProzessedShaderCoder,
		});

		this.pipelineLayout = gpux.gpuDevice.createPipelineLayout({
			label: "grid",
			bindGroupLayouts: [bindGroup0Layout],
		});
	}

	public recordForwardRendering(renderPassEnoder: GPURenderPassEncoder, key: RenderPipelineKey): void {
		renderPassEnoder.setPipeline(this.pipelineCache.getPipeline(key).gpuPipeline);
		renderPassEnoder.setVertexBuffer(0, Grid.vertexBuffer);
		renderPassEnoder.setBindGroup(0, this.project.renderers[RealtimeRenderer.rendererKey].bindGroup0);
		renderPassEnoder.draw(Grid.vertexData.length / 2);
	}
}

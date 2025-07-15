import { GPUX } from "../GPUX";
import { AbstractMetaRenderPipeline, RenderPipelineKey } from "../rendering/AbstractMetaRenderingPipeline";
import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";
import { Project } from "../project/Project";
import { resolveShader } from "../rendering/ShaderUtils";
import staticShaderCode from "./minecraftOpaque.wgsl?raw";
import RealtimeRenderer from "../rendering/RealtimeRenderer";

const shaderCode = staticShaderCode;
const preProzessedShaderCoder = resolveShader(shaderCode);
const primiteState: GPUPrimitiveState = {
	frontFace: "ccw",
	topology: "triangle-strip",
	cullMode: "back",
};
const vertexBufferLayout: GPUVertexBufferLayout[] = [
	{
		arrayStride: 9 * 4,
		attributes: [
			{ shaderLocation: 0, offset: 0, format: "float32x3" },
			{ shaderLocation: 1, offset: 3 * 4, format: "float32x3" },
			{ shaderLocation: 2, offset: 6 * 4, format: "float32x3" },
		],
		stepMode: "instance",
	},
	{
		arrayStride: 6 * 4,
		attributes: [
			{ shaderLocation: 3, offset: 0, format: "float32x2" },
			{ shaderLocation: 4, offset: 2 * 4, format: "float32x2" },
			{ shaderLocation: 5, offset: 4 * 4, format: "float32x2" },
		],
		stepMode: "instance",
	},
	{
		arrayStride: 8,
		attributes: [
			{ shaderLocation: 6, offset: 0, format: "uint32" },
			{ shaderLocation: 7, offset: 4, format: "uint32" },
		],
		stepMode: "instance",
	},
];

const vertexEntryPoint = "vertex_main";
const fragmentEntryPoint = "fragment_main";

export class MinecraftRenderingPipeline extends AbstractRenderingPipeline {
	protected gpux: GPUX;
	protected primiteState: GPUPrimitiveState;
	protected vertexState: GPUVertexState;
	protected fragmentState: GPUFragmentState;

	public constructor(
		label: string,
		shaderModule: GPUShaderModule,
		vertexEntryPoint: string,
		fragmentEntryPoint: string,
		key: RenderPipelineKey,
		gpux: GPUX,
	) {
		super(label, shaderModule);
		this.gpux = gpux;
		this.primiteState = primiteState;

		const constants = AbstractMetaRenderPipeline.getConstantsFromKey(key);

		this.vertexState = {
			module: this.shaderModule,
			constants: constants,
			buffers: vertexBufferLayout,
			entryPoint: vertexEntryPoint,
		};

		this.fragmentState = {
			module: this.shaderModule,
			targets: AbstractMetaRenderPipeline.getRenderingFragmentTargetsFromKey(key, gpux),
			constants: constants,
			entryPoint: fragmentEntryPoint,
		};
	}

	public static createPipelineLayout(gpux: GPUX, bindGroup0Layout: GPUBindGroupLayout) {
		return gpux.gpuDevice.createPipelineLayout({
			label: "Minecraft opaque pipeline layout",
			bindGroupLayouts: [bindGroup0Layout, MinecraftMetaRenderingPipeline.bindGroup1Layout],
		});
	}
}

export class MinecraftMetaRenderingPipeline extends AbstractMetaRenderPipeline {
	protected project: Project;
	protected shaderModule: GPUShaderModule;
	protected renderingPipelineLayout: GPUPipelineLayout;

	public constructor(project: Project, id: string, bindGroup0Layout: GPUBindGroupLayout) {
		super(id);
		this.project = project;
		this.renderingPipelineLayout = MinecraftRenderingPipeline.createPipelineLayout(
			this.project.gpux,
			bindGroup0Layout,
		);
		this.shaderModule = project.gpux.gpuDevice.createShaderModule({
			code: preProzessedShaderCoder,
			label: `minecraft shader module`,
			compilationHints: [
				{
					entryPoint: vertexEntryPoint,
					layout: this.renderingPipelineLayout,
				},
				{
					entryPoint: fragmentEntryPoint,
					layout: this.renderingPipelineLayout,
				},
			],
		});
	}

	protected _buildRenderingPipeline = (key: RenderPipelineKey) => {
		return new MinecraftRenderingPipeline(
			`${this.id} pipeline`,
			this.shaderModule,
			vertexEntryPoint,
			fragmentEntryPoint,
			key,
			this.project.gpux,
		);
	};
	protected _buildDepthPipeline(): AbstractRenderingPipeline {
		throw new Error("Method not implemented.");
	}
	protected _buildSelectionPipeline(): AbstractRenderingPipeline {
		throw new Error("Method not implemented.");
	}

	public static bindGroup1Layout: GPUBindGroupLayout;
	public static metaPipeline: MinecraftMetaRenderingPipeline;
	public static init(project: Project) {
		this.bindGroup1Layout = project.gpux.gpuDevice.createBindGroupLayout({
			label: "minecraft bind group 1 layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer: {
						type: "uniform",
					},
				},
			],
		});
		this.metaPipeline = new MinecraftMetaRenderingPipeline(
			project,
			"Minecraft Opaque Pipeline",
			project.renderers[RealtimeRenderer.rendererKey].bindGroup0Layout,
		);
	}
}

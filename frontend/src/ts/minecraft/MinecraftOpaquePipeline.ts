import { GPUX } from "../GPUX";
import { AbstractMetaRenderPipeline, RenderPipelineKey } from "../rendering/AbstractMetaRenderingPipeline";
import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";
import { resolveShader } from "../rendering/ShaderUtils";
import staticShaderCode from "./minecraftOpaque.wgsl?raw";

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
		layout: GPUPipelineLayout,
	) {
		super(label, shaderModule);
		this.gpux = gpux;
		this.primiteState = primiteState;

		const constants = AbstractMetaRenderPipeline.getConstantsFromKey(key);
		this.depthStencilState.depthCompare = "less";
		this.depthStencilState.depthWriteEnabled = true;

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
		this.buildPipeline(gpux.gpuDevice, layout);
	}
}

export class MinecraftDepthRenderingPipeline extends AbstractRenderingPipeline {
	protected gpux: GPUX;
	protected primiteState: GPUPrimitiveState;
	protected vertexState: GPUVertexState;
	protected fragmentState: GPUFragmentState;

	public constructor(
		label: string,
		shaderModule: GPUShaderModule,
		vertexEntryPoint: string,
		fragmentEntryPoint: string,
		gpux: GPUX,
	) {
		super(label, shaderModule);
		this.gpux = gpux;
		this.primiteState = primiteState;

		this.vertexState = {
			module: this.shaderModule,
			buffers: vertexBufferLayout,
			entryPoint: vertexEntryPoint,
		};

		this.fragmentState = {
			module: this.shaderModule,
			targets: [],
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
	protected _gpux: GPUX;
	protected shaderModule: GPUShaderModule;

	public constructor(id: string, gpux: GPUX) {
		super(id);
		this._renderPiplineCache.buildFunction = this._buildRenderingPipeline;
		this._gpux = gpux;

		this.shaderModule = gpux.gpuDevice.createShaderModule({
			code: preProzessedShaderCoder,
			label: `minecraft shader module`,
			compilationHints: [
				{
					entryPoint: vertexEntryPoint,
					layout: MinecraftMetaRenderingPipeline.renderPipelineLayout,
				},
				{
					entryPoint: fragmentEntryPoint,
					layout: MinecraftMetaRenderingPipeline.renderPipelineLayout,
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
			this._gpux,
			MinecraftMetaRenderingPipeline.renderPipelineLayout,
		);
	};
	protected _buildDepthPipeline(): AbstractRenderingPipeline {
		return new MinecraftDepthRenderingPipeline(
			`${this.id} depth pipeline`,
			this.shaderModule,
			vertexEntryPoint,
			fragmentEntryPoint,
			this._gpux,
		);
	}
	protected _buildSelectionPipeline(): AbstractRenderingPipeline {
		throw new Error("Method not implemented.");
	}

	public static bindGroup1Layout: GPUBindGroupLayout;
	public static renderPipelineLayout: GPUPipelineLayout;
	public static metaPipeline: MinecraftMetaRenderingPipeline;
	public static init(gpux: GPUX, bindGroup0Layout: GPUBindGroupLayout) {
		this.bindGroup1Layout = gpux.gpuDevice.createBindGroupLayout({
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
		this.renderPipelineLayout = gpux.gpuDevice.createPipelineLayout({
			label: "Minecraft opaque pipeline layout",
			bindGroupLayouts: [bindGroup0Layout, MinecraftMetaRenderingPipeline.bindGroup1Layout],
		});
		this.metaPipeline = new MinecraftMetaRenderingPipeline("Minecraft Opaque Pipeline", gpux);
	}
}

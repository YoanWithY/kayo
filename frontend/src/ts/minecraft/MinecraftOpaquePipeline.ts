import { GPUX } from "../GPUX";
import { Kayo } from "../Kayo";
import { Representation } from "../project/Representation";
import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";
import { RealtimeSpecificRenderConfig } from "../rendering/config/RealtimeRenderConfig";
import { RenderConfig } from "../rendering/config/RenderConfig";
import RealtimeRenderable from "../rendering/RealtimeRenderable";
import RealtimeRenderer from "../rendering/RealtimeRenderer";
import { resolveShader } from "../rendering/ShaderUtils";
import staticShaderCode from "./minecraftOpaque.wgsl?raw";
import { MinecraftWorld } from "./MinecraftWorld";

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

export class MinecraftRealtimeRenderingPipeline extends AbstractRenderingPipeline {
	protected gpux: GPUX;
	protected primiteState: GPUPrimitiveState;
	protected vertexState: GPUVertexState;
	protected fragmentState: GPUFragmentState;

	public constructor(
		label: string,
		shaderModule: GPUShaderModule,
		vertexEntryPoint: string,
		fragmentEntryPoint: string,
		config: RenderConfig,
		gpux: GPUX,
		layout: GPUPipelineLayout,
	) {
		super(label, shaderModule);
		this.gpux = gpux;
		this.primiteState = primiteState;

		const constants = RealtimeRenderer.getConstantsFromConfig(config);
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
			targets: RealtimeRenderer.getRenderingFragmentTargetsFromConfig(config, gpux),
			constants: constants,
			entryPoint: fragmentEntryPoint,
		};
		this.multisample.count = (config.specific as RealtimeSpecificRenderConfig).antialiasing.msaa;
		this.buildOrRebuildPipeline(gpux.gpuDevice, layout);
	}
}

export class MinecraftWorldRealtimeRenderingRepresentation
	extends Representation<RealtimeRenderer, MinecraftWorld>
	implements RealtimeRenderable
{
	protected _kayo: Kayo;
	protected _currentPipeline: MinecraftRealtimeRenderingPipeline;
	protected _currentRenderBundle: GPURenderBundle;

	public constructor(
		kayo: Kayo,
		representationConcept: RealtimeRenderer,
		representationSubject: MinecraftWorld,
		config: RenderConfig,
	) {
		super(representationConcept, representationSubject);
		this._kayo = kayo;
		this._currentPipeline = this._buildRenderingPipeline(config);
		this._currentRenderBundle = this._buildRenderBundle(config);
	}

	protected _buildRenderingPipeline(config: RenderConfig) {
		return new MinecraftRealtimeRenderingPipeline(
			`Minecraft Realtime Opaque`,
			MinecraftWorldRealtimeRenderingRepresentation.shaderModule,
			vertexEntryPoint,
			fragmentEntryPoint,
			config,
			this._kayo.gpux,
			MinecraftWorldRealtimeRenderingRepresentation.renderPipelineLayout,
		);
	}

	protected _recordRender(renderPassEncoder: GPURenderPassEncoder | GPURenderBundleEncoder) {
		let quads = 0;
		let chunks = 0;
		for (const key in this.represenationSubject.sections) {
			chunks++;
			quads += this.represenationSubject.sections[key].render(renderPassEncoder);
		}
		console.log(quads, chunks);
	}

	public recordForwardRendering(renderPassEncoder: GPURenderPassEncoder) {
		renderPassEncoder.executeBundles([this._currentRenderBundle]);
	}

	protected _buildRenderBundle(config: RenderConfig) {
		const renderBundleEncoder = this._kayo.gpux.gpuDevice.createRenderBundleEncoder({
			label: "minecraft realtime",
			colorFormats: RealtimeRenderer.getColorFormats(config, this._kayo.gpux),
			depthStencilFormat: "depth24plus",
			sampleCount: (config.specific as RealtimeSpecificRenderConfig).antialiasing.msaa,
		});
		renderBundleEncoder.setBindGroup(0, this.representationConcept.bindGroup0);

		renderBundleEncoder.setPipeline(this._currentPipeline.gpuPipeline);
		this._recordRender(renderBundleEncoder);
		return renderBundleEncoder.finish({ label: "Minecraft World bundle" });
	}

	public update(): void {
		this._currentPipeline = this._buildRenderingPipeline(this.representationConcept.config);
		this._currentRenderBundle = this._buildRenderBundle(this.representationConcept.config);
	}

	public static shaderModule: GPUShaderModule;
	public static bindGroup1Layout: GPUBindGroupLayout;
	public static renderPipelineLayout: GPUPipelineLayout;
	public static metaPipeline: MinecraftWorldRealtimeRenderingRepresentation;
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
			bindGroupLayouts: [bindGroup0Layout, MinecraftWorldRealtimeRenderingRepresentation.bindGroup1Layout],
		});
		this.shaderModule = gpux.gpuDevice.createShaderModule({
			code: preProzessedShaderCoder,
			label: `minecraft shader module`,
			compilationHints: [
				{
					entryPoint: vertexEntryPoint,
					layout: MinecraftWorldRealtimeRenderingRepresentation.renderPipelineLayout,
				},
				{
					entryPoint: fragmentEntryPoint,
					layout: MinecraftWorldRealtimeRenderingRepresentation.renderPipelineLayout,
				},
			],
		});
	}
}

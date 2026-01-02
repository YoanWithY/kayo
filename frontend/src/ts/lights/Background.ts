import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";
import { GPUX } from "../GPUX";
import staticShaderCode from "./background.wgsl?raw";
import { resolveShader } from "../rendering/ShaderUtils";
import RealtimeRenderer from "../rendering/RealtimeRenderer";
import { Representable, Representation } from "../project/Representation";
import { Kayo } from "../Kayo";
import { RenderConfig } from "../rendering/config/RenderConfig";
import { RealtimeSpecificRenderConfig } from "../rendering/config/RealtimeRenderConfig";
import RealtimeRenderable from "../rendering/RealtimeRenderable";

const vertexBufferLayout: GPUVertexBufferLayout[] = [
	{
		arrayStride: 12,
		attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }],
	},
];
const preProzessedShaderCoder = resolveShader(staticShaderCode);

class BackgroundRealtimeRenderingPipeline extends AbstractRenderingPipeline {
	protected primiteState: GPUPrimitiveState;
	protected vertexState: GPUVertexState;
	protected fragmentState: GPUFragmentState;
	public constructor(
		label: string,
		shaderModule: GPUShaderModule,
		renderConfig: RenderConfig,
		gpux: GPUX,
		layout: GPUPipelineLayout,
	) {
		super(label, shaderModule);
		this.primiteState = {
			cullMode: "front",
			frontFace: "ccw",
			topology: "triangle-list",
		};
		const constants = RealtimeRenderer.getConstantsFromConfig(renderConfig);

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
			targets: RealtimeRenderer.getRenderingFragmentTargetsFromConfig(renderConfig, gpux),
		};

		this.multisample.count = (renderConfig.specific as RealtimeSpecificRenderConfig).antialiasing.msaa;

		this.buildOrRebuildPipeline(gpux.gpuDevice, layout);
	}
}

export class BackgroundRealtimeRenderingRepresentation
	extends Representation<RealtimeRenderer, Backgrund>
	implements RealtimeRenderable
{
	protected _kayo: Kayo;
	protected _currentPipeline: BackgroundRealtimeRenderingPipeline;

	public constructor(
		kayo: Kayo,
		representationConcept: RealtimeRenderer,
		representationSubject: Backgrund,
		realtimeConfig: RenderConfig,
	) {
		super(representationConcept, representationSubject);
		this._kayo = kayo;
		this._currentPipeline = this._buildPipeline(realtimeConfig);
	}

	public recordForwardRendering(renderPassEnoder: GPURenderPassEncoder): void {
		renderPassEnoder.setPipeline(this._currentPipeline.gpuPipeline);
		renderPassEnoder.setVertexBuffer(0, BackgroundRealtimeRenderingRepresentation._vertexBuffer);
		renderPassEnoder.setIndexBuffer(BackgroundRealtimeRenderingRepresentation._indexBuffer, "uint16");
		renderPassEnoder.setBindGroup(0, this.representationConcept.bindGroup0);
		renderPassEnoder.drawIndexed(6 * 2 * 3, 1);
	}

	private _buildPipeline(config: RenderConfig) {
		return new BackgroundRealtimeRenderingPipeline(
			"background",
			BackgroundRealtimeRenderingRepresentation.shaderModule,
			config,
			this._kayo.gpux,
			BackgroundRealtimeRenderingRepresentation.pipelineLayout,
		);
	}

	public update(config: RenderConfig): void {
		this._currentPipeline = this._buildPipeline(config);
	}

	public static shaderModule: GPUShaderModule;
	private static _vertexBuffer: GPUBuffer;
	private static _indexBuffer: GPUBuffer;
	public static pipelineLayout: GPUPipelineLayout;
	public static init(gpux: GPUX, bindGroup0Layout: GPUBindGroupLayout) {
		const vertices = [1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1];
		this._vertexBuffer = gpux.gpuDevice.createBuffer({
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
		this._indexBuffer = gpux.gpuDevice.createBuffer({
			label: "Background Box index buffer",
			size: indices.length * 2,
			mappedAtCreation: true,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.INDEX,
		});
		new Uint16Array(this._indexBuffer.getMappedRange()).set(indices);
		this._indexBuffer.unmap();

		this.shaderModule = gpux.gpuDevice.createShaderModule({
			label: "background",
			code: preProzessedShaderCoder,
		});

		this.pipelineLayout = gpux.gpuDevice.createPipelineLayout({
			label: "background",
			bindGroupLayouts: [bindGroup0Layout],
		});
	}
}

export class Backgrund extends Representable {}

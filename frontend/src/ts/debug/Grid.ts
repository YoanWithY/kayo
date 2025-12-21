import Renderable from "../rendering/Renderable";
import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";
import staticShaderCode from "./grid.wgsl?raw";

import { GPUX } from "../GPUX";
import { resolveShader } from "../rendering/ShaderUtils";
import RealtimeRenderer from "../rendering/RealtimeRenderer";
import { Representable, Representation } from "../project/Representation";
import { Kayo } from "../Kayo";
import { RenderConfig } from "../rendering/config/RenderConfig";
import { RealtimeSpecificRenderConfig } from "../rendering/config/RealtimeRenderConfig";

const vertexBufferLayout: GPUVertexBufferLayout[] = [
	{
		arrayStride: 2 * 4,
		attributes: [{ shaderLocation: 0, offset: 0, format: "float32x2" }],
	},
];

export class GridRealtimePipeline extends AbstractRenderingPipeline {
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
		config: RenderConfig,
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

		const constants = RealtimeRenderer.getConstantsFromConfig(config);

		this.vertexState = {
			module: shaderModule,
			constants: constants,
			buffers: vertexBufferLayout,
		};

		const targets = RealtimeRenderer.getRenderingFragmentTargetsFromConfig(config, gpux);
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
		this.multisample.count = (config.specific as RealtimeSpecificRenderConfig).antialiasing.msaa;
		this.buildPipeline(gpux.gpuDevice, layout);
	}
}

const preProzessedShaderCoder = resolveShader(staticShaderCode);

export class GridRelatimeRepresentation extends Representation<RealtimeRenderer, Grid> implements Renderable {
	protected _kayo: Kayo;
	protected _currentPipeline: GridRealtimePipeline;
	public constructor(
		kayo: Kayo,
		representationConcept: RealtimeRenderer,
		representationSubject: Grid,
		realtimeConfig: RenderConfig,
	) {
		super(representationConcept, representationSubject);
		this._kayo = kayo;
		this._currentPipeline = this._buildPipeline(realtimeConfig);
	}

	private _buildPipeline(config: RenderConfig) {
		return new GridRealtimePipeline(
			"Grid Realtime",
			GridRelatimeRepresentation.shaderModule,
			config,
			this._kayo.gpux,
			GridRelatimeRepresentation.pipelineLayout,
		);
	}

	public update(config: RenderConfig): void {
		this._currentPipeline = this._buildPipeline(config);
	}

	public recordForwardRendering(renderPassEnoder: GPURenderPassEncoder): void {
		renderPassEnoder.setPipeline(this._currentPipeline.gpuPipeline);
		renderPassEnoder.setVertexBuffer(0, GridRelatimeRepresentation.vertexBuffer);
		renderPassEnoder.setBindGroup(0, this._representationConcept.bindGroup0);
		renderPassEnoder.draw(GridRelatimeRepresentation.vertexData.length / 2);
	}

	public static shaderModule: GPUShaderModule;
	public static pipelineLayout: GPUPipelineLayout;
	public static vertexBuffer: GPUBuffer;
	public static vertexData: number[] = [];
	public static init(gpux: GPUX, bindGroup0Layout: GPUBindGroupLayout) {
		GridRealtimePipeline.pushRotation(this.vertexData, 10000, 1000);
		GridRealtimePipeline.pushRotation(this.vertexData, 1000, 100);
		GridRealtimePipeline.pushRotation(this.vertexData, 100, 10);
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
}

export class Grid extends Representable {}

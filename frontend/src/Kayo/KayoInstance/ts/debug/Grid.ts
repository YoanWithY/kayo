import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";
import staticShaderCode from "./grid.wgsl?raw";

import { GPUX } from "../GPUX";
import { resolveShader } from "../rendering/ShaderUtils";
import { Representable, Representation } from "../project/Representation";
import { KayoInstance } from "../KayoInstance";
import { RealtimeConfigObject } from "../rendering/config/RealtimeRenderConfig";
import { RealtimeRenderer } from "../rendering/RealtimeRenderer";
import { RealtimeRenderableRepresentation } from "../rendering/RealtimeRenderableRepresentation";
import { SceneObject } from "../project/SceneObject";

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
	public static pushRotation(arr: number[], outer: number, inner: number, splitMiddle = false) {
		if (splitMiddle)
			arr.push(
				-outer,
				-outer,

				-inner,
				-inner,

				-outer,
				0,

				-inner,
				0,

				-outer,
				outer,

				-inner,
				inner,

				0,
				outer,

				0,
				inner,

				outer,
				outer,

				inner,
				inner,

				outer,
				0,

				inner,
				0,

				outer,
				-outer,

				inner,
				-inner,

				0,
				-outer,

				0,
				-inner,

				-outer,
				-outer,

				-inner,
				-inner,
			);
		else
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
		config: RealtimeConfigObject,
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

		const targets = RealtimeRenderer.getRenderingFragmentTargetsFromConfig(config.bitDepth, gpux);
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
		this.multisample.count = config.msaa;
		this.buildOrRebuildPipeline(gpux.gpuDevice, layout);
	}
}

const preProzessedShaderCoder = resolveShader(staticShaderCode);

export class GridRealtimeRepresentation extends Representation<RealtimeRenderer, Grid> implements RealtimeRenderableRepresentation {
	protected _kayo: KayoInstance;
	protected _currentPipeline: GridRealtimePipeline;
	public constructor(
		kayo: KayoInstance,
		representationConcept: RealtimeRenderer,
		representationSubject: Grid,
		realtimeConfig: RealtimeConfigObject,
	) {
		super(representationConcept, representationSubject);
		this._kayo = kayo;
		this._currentPipeline = this._buildPipeline(realtimeConfig);
	}
	public get representationType(): string {
		return this.represenationSubject.type;
	}

	private _buildPipeline(config: RealtimeConfigObject) {
		return new GridRealtimePipeline(
			"Grid Realtime",
			GridRealtimeRepresentation.shaderModule,
			config,
			this._kayo.gpux,
			GridRealtimeRepresentation.pipelineLayout,
		);
	}

	public update(config: RealtimeConfigObject): void {
		this._currentPipeline = this._buildPipeline(config);
	}

	public recordForwardRendering(renderPassEnoder: GPURenderPassEncoder): void {
		renderPassEnoder.setPipeline(this._currentPipeline.gpuPipeline);
		renderPassEnoder.setVertexBuffer(0, GridRealtimeRepresentation.vertexBuffer);
		renderPassEnoder.setBindGroup(0, this._representationConcept.bindGroup0);
		renderPassEnoder.draw(GridRealtimeRepresentation.vertexData.length / 2);
	}

	public static shaderModule: GPUShaderModule;
	public static pipelineLayout: GPUPipelineLayout;
	public static vertexBuffer: GPUBuffer;
	public static vertexData: number[] = [];
	public static init(gpux: GPUX, bindGroup0Layout: GPUBindGroupLayout) {
		GridRealtimePipeline.pushRotation(this.vertexData, 100000, 10000, true);
		GridRealtimePipeline.pushRotation(this.vertexData, 10000, 1000, true);
		GridRealtimePipeline.pushRotation(this.vertexData, 1000, 100, true);
		GridRealtimePipeline.pushRotation(this.vertexData, 100, 10, true);
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

export class Grid extends Representable implements SceneObject {
	public get type(): string {
		return "Grid";
	}
}

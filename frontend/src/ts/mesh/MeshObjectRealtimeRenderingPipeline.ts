import { GPUX } from "../GPUX";
import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";
import { RealtimeSpecificRenderConfig } from "../rendering/config/RealtimeRenderConfig";
import { RenderConfig } from "../rendering/config/RenderConfig";
import RealtimeRenderer from "../rendering/RealtimeRenderer";

export class MeshObjectRealtimeRenderingPipeline extends AbstractRenderingPipeline {
	protected _gpux: GPUX;
	protected primiteState: GPUPrimitiveState;
	protected vertexState!: GPUVertexState;
	protected fragmentState!: GPUFragmentState;
	protected _vertexBufferLayout: GPUVertexBufferLayout[];
	protected _pipelineLayout: GPUPipelineLayout;
	protected _vertexEntryPoint: string;
	protected _fragmentEntryPoint: string;

	public constructor(
		label: string,
		shaderModule: GPUShaderModule,
		vertexEntryPoint: string,
		fragmentEntryPoint: string,
		config: RenderConfig,
		gpux: GPUX,
		pipelineLayout: GPUPipelineLayout,
		vertexBufferLayout: GPUVertexBufferLayout[],
	) {
		super(label, shaderModule);
		this._gpux = gpux;
		this._pipelineLayout = pipelineLayout;
		this._vertexBufferLayout = vertexBufferLayout;
		this.depthStencilState.depthCompare = "less";
		this.depthStencilState.depthWriteEnabled = true;
		this.primiteState = {
			topology: "triangle-list",
			cullMode: "back",
			frontFace: "ccw",
		};
		this._fragmentEntryPoint = fragmentEntryPoint;
		this._vertexEntryPoint = vertexEntryPoint;
		this._initFromConfig(config);
		this.buildOrRebuildPipeline(gpux.gpuDevice, this._pipelineLayout);
	}

	private _initFromConfig(config: RenderConfig) {
		const constants = RealtimeRenderer.getConstantsFromConfig(config);
		this.vertexState = {
			module: this.shaderModule,
			constants: constants,
			buffers: this._vertexBufferLayout,
			entryPoint: this._vertexEntryPoint,
		};

		this.fragmentState = {
			module: this.shaderModule,
			targets: RealtimeRenderer.getRenderingFragmentTargetsFromConfig(config, this._gpux),
			constants: constants,
			entryPoint: this._fragmentEntryPoint,
		};
		this.multisample.count = (config.specific as RealtimeSpecificRenderConfig).antialiasing.msaa;
	}

	public get vertexBufferLayout() {
		return this._vertexBufferLayout;
	}

	public update(config: RenderConfig) {
		this._initFromConfig(config);
		this.buildOrRebuildPipeline(this._gpux.gpuDevice, this._pipelineLayout);
	}
}

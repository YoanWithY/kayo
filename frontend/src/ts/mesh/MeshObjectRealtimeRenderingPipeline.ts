import { GPUX } from "../GPUX";
import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";
import { RealtimeSpecificRenderConfig } from "../rendering/config/RealtimeRenderConfig";
import { RenderConfig } from "../rendering/config/RenderConfig";
import RealtimeRenderer from "../rendering/RealtimeRenderer";

export class MeshObjectRealtimeRenderingPipeline extends AbstractRenderingPipeline {
	protected primiteState: GPUPrimitiveState;
	protected vertexState: GPUVertexState;
	protected fragmentState: GPUFragmentState;
	protected _vertexBufferLayout: GPUVertexBufferLayout[];

	public constructor(
		label: string,
		shaderModule: GPUShaderModule,
		vertexEntryPoint: string,
		fragmentEntryPoint: string,
		config: RenderConfig,
		gpux: GPUX,
		layout: GPUPipelineLayout,
		vertexBufferLayout: GPUVertexBufferLayout[],
	) {
		super(label, shaderModule);
		this._vertexBufferLayout = vertexBufferLayout;
		const constants = RealtimeRenderer.getConstantsFromConfig(config);
		this.depthStencilState.depthCompare = "less";
		this.depthStencilState.depthWriteEnabled = true;

		this.primiteState = {
			topology: "triangle-list",
			cullMode: "back",
			frontFace: "ccw",
		};
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
		this.buildPipeline(gpux.gpuDevice, layout);
	}

	public get vertexBufferLayout() {
		return this._vertexBufferLayout;
	}
}

import { GPUX } from "../GPUX";
import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";
import { RealtimeSpecificRenderConfig } from "../rendering/config/RealtimeRenderConfig";
import { RenderConfig } from "../rendering/config/RenderConfig";
import RealtimeRenderer from "../rendering/RealtimeRenderer";

const vertexBufferLayout: GPUVertexBufferLayout[] = [
	{
		arrayStride: 8 * 4,
		attributes: [
			{ shaderLocation: 0, offset: 0, format: "float32x3" }, // position
			{ shaderLocation: 1, offset: 3 * 4, format: "float32x3" }, // normal
			{ shaderLocation: 2, offset: 6 * 4, format: "float32x2" }, // uv
		],
		stepMode: "vertex",
	},
];

export class MeshObjectRealtimeRenderingPipeline extends AbstractRenderingPipeline {
	protected primiteState: GPUPrimitiveState = {
		topology: "triangle-list",
		cullMode: "none",
		frontFace: "ccw",
	};
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
		this.buildPipeline(gpux.gpuDevice, layout);
	}
}

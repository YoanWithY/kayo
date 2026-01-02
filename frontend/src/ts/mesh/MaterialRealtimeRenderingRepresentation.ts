import { Kayo } from "../Kayo";
import { Representation } from "../project/Representation";
import RealtimeRenderer from "../rendering/RealtimeRenderer";
import { equalByValue } from "../Utils";
import { Material } from "./Material";
import { MeshObjectRealtimeRenderingPipeline } from "./MeshObjectRealtimeRenderingPipeline";
import { MeshObjectRealtimeRenderingRepresentation } from "./MeshObjectRealtimeRenderingRepresentation";
import staticShaderCode from "./default.wgsl?raw";
import { resolveShader } from "../rendering/ShaderUtils";

/**
 * The representation of the Material for an instance of a RealtimeRenderer.
 * This maintains a cach for various versions of {@link MeshObjectRealtimeRenderingPipeline}s that
 * may need to be created due to different requirements from the Mesh (geometry, attributes...) for the GPU pipeline.
 */
export class MaterialRealtimeRenderingRepresentation extends Representation<RealtimeRenderer, Material> {
	private _pipelines: MeshObjectRealtimeRenderingPipeline[];
	private _kayo: Kayo;

	public constructor(kayo: Kayo, representationConcept: RealtimeRenderer, representationSubject: Material) {
		super(representationConcept, representationSubject);
		this._pipelines = [];
		this._kayo = kayo;
	}

	public getOrCreatePipelineFor(meshObject: MeshObjectRealtimeRenderingRepresentation) {
		const vertexLayout = meshObject.vertexBufferLayout;
		const e = (v: MeshObjectRealtimeRenderingPipeline) => equalByValue(vertexLayout, v.vertexBufferLayout);
		let pipeline = this._pipelines.find(e);
		if (pipeline) return pipeline;
		pipeline = this._createPipelineFor(meshObject);
		this._pipelines.push(pipeline);
		return pipeline;
	}

	public update() {
		for (const pipeline of this._pipelines) pipeline.update(this.representationConcept.config);
	}

	private _createPipelineFor(
		meshObject: MeshObjectRealtimeRenderingRepresentation,
	): MeshObjectRealtimeRenderingPipeline {
		// this should be replaced by an actual compiler
		const gpux = this._kayo.gpux;
		const vertexEntryPoint = "vertex_main";
		const fragmentEntryPoint = "fragment_main";
		const preProzessedShaderCoder = resolveShader(staticShaderCode);

		const pipelineLayout = gpux.gpuDevice.createPipelineLayout({
			label: "wip pipeline layout",
			bindGroupLayouts: [this.representationConcept.bindGroup0Layout],
		});

		const shaderModule = gpux.gpuDevice.createShaderModule({
			code: preProzessedShaderCoder,
			label: `wip shader module`,
			compilationHints: [
				{
					entryPoint: vertexEntryPoint,
					layout: pipelineLayout,
				},
				{
					entryPoint: fragmentEntryPoint,
					layout: pipelineLayout,
				},
			],
		});

		const pipeline = new MeshObjectRealtimeRenderingPipeline(
			"wip",
			shaderModule,
			vertexEntryPoint,
			fragmentEntryPoint,
			this._representationConcept.config,
			this._kayo.gpux,
			pipelineLayout,
			meshObject.vertexBufferLayout,
		);

		return pipeline;
	}
}

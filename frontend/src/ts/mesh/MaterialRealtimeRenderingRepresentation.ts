import { Kayo } from "../Kayo";
import { Representation } from "../project/Representation";
import RealtimeRenderer from "../rendering/RealtimeRenderer";
import { equalByValue } from "../Utils";
import { Material } from "./Material";
import { MeshObjectRealtimeRenderingPipeline } from "./MeshObjectRealtimeRenderingPipeline";
import { MeshObjectRealtimeRenderingRepresentation } from "./MeshObjectRealtimeRenderingRepresentation";
import staticShaderCode from "./default.wgsl?raw";
import { resolveShader } from "../rendering/ShaderUtils";

class RealtimePipelineCompilationCach {
	private _materialRealtimeRenderingRepresentation: MaterialRealtimeRenderingRepresentation;
	private _pipelines: MeshObjectRealtimeRenderingPipeline[];
	public constructor(materialRealtimeRenderingRepresentation: MaterialRealtimeRenderingRepresentation) {
		this._pipelines = [];
		this._materialRealtimeRenderingRepresentation = materialRealtimeRenderingRepresentation;
	}

	public getOrCreatePipelineFor(meshObject: MeshObjectRealtimeRenderingRepresentation) {
		const vertexLayout = meshObject.vertexBufferLayout;
		const e = (v: MeshObjectRealtimeRenderingPipeline) => equalByValue(vertexLayout, v.vertexBufferLayout);
		let pipeline = this._pipelines.find(e);
		if (pipeline) return pipeline;
		pipeline = this._materialRealtimeRenderingRepresentation.compileFor(meshObject);
		this._pipelines.push(pipeline);
		return pipeline;
	}
}

export class MaterialRealtimeRenderingRepresentation extends Representation<RealtimeRenderer, Material> {
	private _compilationCach: RealtimePipelineCompilationCach;
	private _kayo: Kayo;

	public constructor(kayo: Kayo, representationConcept: RealtimeRenderer, representationSubject: Material) {
		super(representationConcept, representationSubject);
		this._compilationCach = new RealtimePipelineCompilationCach(this);
		this._kayo = kayo;
	}

	public get compilationCach() {
		return this._compilationCach;
	}

	public compileFor(meshObject: MeshObjectRealtimeRenderingRepresentation): MeshObjectRealtimeRenderingPipeline {
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

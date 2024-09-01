import { gpuDevice } from "../GPUX";
import { fragmentEntryPoint, Material, vertexEntryPoint } from "./Material";
import staticShaderCode from "../../wgsl/heightField.wgsl?raw";
import { resolveIncludes } from "../rendering/Shader";
import Renderer from "../rendering/Renderer";



export class HeightFieldMaterial extends Material {
	pipeline: GPURenderPipeline;
	readonly isDisplayOutputPipeline = true;
	readonly shaderCode: string;
	readonly preProzessedShaderCoder;
	readonly shaderModule: GPUShaderModule;
	vertexConstants: Record<string, number>;
	vertexBufferLayout: GPUVertexBufferLayout[];
	fragmentConstants: Record<string, number>;
	fragmentTargets: GPUColorTargetState[];
	topology: GPUPrimitiveTopology;
	cullMode: GPUCullMode;
	stripIndexFormat?: GPUIndexFormat;
	depthStencilFormat: GPUTextureFormat;
	depthCompare: GPUCompareFunction;
	depthWriteEnabled: boolean;

	/**
	 * 
	 * @param label The label of the 
	 * @param shaderCode 
	 */
	constructor(label: string) {
		super(label);
		this.shaderCode = staticShaderCode;
		this.preProzessedShaderCoder = resolveIncludes(this.shaderCode);
		this.vertexConstants = {};
		this.vertexBufferLayout = [];
		this.fragmentConstants = Renderer.getDisplayFragmentOutputConstantsCopy();
		this.topology = "triangle-strip";
		this.cullMode = "none";
		this.depthCompare = "always";
		this.depthWriteEnabled = true;
		this.depthStencilFormat = Renderer.getDepthStencilFormat();
		this.fragmentTargets = Renderer.getFragmentTargets();

		this.shaderModule = gpuDevice.createShaderModule(
			{
				code: this.preProzessedShaderCoder,
				compilationHints: [{ entryPoint: vertexEntryPoint }, { entryPoint: fragmentEntryPoint }]
			});
		this.pipeline = this.buildPipeline();
	}

	createPipelineLayout(): GPUPipelineLayout | "auto" {
		return "auto";
	}

}
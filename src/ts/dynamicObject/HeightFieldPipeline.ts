import { gpuDevice } from "../GPUX";
import { fragmentEntryPoint, AbstractPipeline, vertexEntryPoint } from "../Material/AbstractPipeline";
import staticShaderCode from "../../wgsl/heightField.wgsl?raw";
import { resolveIncludes } from "../rendering/Shader";
import Renderer from "../rendering/Renderer";

export class HeightFieldPipeline extends AbstractPipeline {
	gpuPipeline: GPURenderPipeline;
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
	bindGroup0Layout: GPUBindGroupLayout;

	constructor(label: string, bindGroup0Layout: GPUBindGroupLayout) {
		super(label);
		this.bindGroup0Layout = bindGroup0Layout;
		this.shaderCode = staticShaderCode;
		this.preProzessedShaderCoder = resolveIncludes(this.shaderCode);
		this.vertexConstants = {};
		this.vertexBufferLayout = [];
		this.fragmentConstants = Renderer.getDisplayFragmentOutputConstantsCopy();
		this.topology = "triangle-strip";
		this.cullMode = "none";
		this.depthCompare = "less";
		this.depthWriteEnabled = true;
		this.depthStencilFormat = Renderer.getDepthStencilFormat();
		this.fragmentTargets = Renderer.getFragmentTargets();

		this.shaderModule = gpuDevice.createShaderModule(
			{
				code: this.preProzessedShaderCoder,
				compilationHints: [{ entryPoint: vertexEntryPoint }, { entryPoint: fragmentEntryPoint }]
			});
		this.gpuPipeline = this.buildPipeline();
	}

	createPipelineLayout(): GPUPipelineLayout | "auto" {
		return gpuDevice.createPipelineLayout({
			label: "Height field pipeline layout",
			bindGroupLayouts: [this.bindGroup0Layout],
		});
	}

}
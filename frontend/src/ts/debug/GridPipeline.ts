import { AbstractPipeline, fragmentEntryPoint, vertexEntryPoint } from "../Material/AbstractPipeline";
import staticShaderCode from "../../wgsl/debug/grid.wgsl?raw"
import Renderer from "../rendering/Renderer";
import { resolveShader } from "../rendering/Shader";
import { gpuDevice } from "../GPUX";
import { Project } from "../project/Project";

export class GridPipeline extends AbstractPipeline {
	vertexEntryPoint = vertexEntryPoint;
	fragmentEntryPoint = fragmentEntryPoint;
	gpuPipeline: GPURenderPipeline;
	readonly shaderCode: string;
	readonly isDisplayOutputPipeline: boolean = true;
	readonly preProzessedShaderCoder;
	readonly shaderModule: GPUShaderModule;
	vertexConstants: Record<string, number>;
	vertexBufferLayout: GPUVertexBufferLayout[];
	fragmentConstants: Record<string, number>;
	fragmentTargets: GPUColorTargetState[];
	topology: GPUPrimitiveTopology;
	cullMode: GPUCullMode;
	stripIndexFormat?: GPUIndexFormat | undefined;
	depthStencilFormat: GPUTextureFormat;
	depthCompare: GPUCompareFunction;
	depthWriteEnabled: boolean;
	bindGroup0Layout: GPUBindGroupLayout;

	constructor(project: Project) {
		super("Grid Pipeline");
		this.bindGroup0Layout = project.renderer.bindGroup0Layout;
		this.shaderCode = staticShaderCode;
		this.preProzessedShaderCoder = resolveShader(this.shaderCode);
		this.vertexConstants = {};
		this.vertexBufferLayout = [];
		this.fragmentConstants = {};
		this.topology = "triangle-strip";
		this.cullMode = "none";
		this.depthCompare = "less";
		this.depthWriteEnabled = false;
		this.depthStencilFormat = Renderer.getDepthStencilFormat();
		this.fragmentTargets = [{
			format: "rgba8unorm",
		}];

		this.shaderModule = gpuDevice.createShaderModule(
			{
				code: this.preProzessedShaderCoder,
				compilationHints: [{ entryPoint: vertexEntryPoint }, { entryPoint: fragmentEntryPoint }]
			});
		this.gpuPipeline = this.buildPipeline();
	}

	createPipelineLayout(): GPUPipelineLayout | "auto" {
		return gpuDevice.createPipelineLayout({
			label: "Debug Grid Pipeline Layout",
			bindGroupLayouts: [this.bindGroup0Layout],
		});
	}

}
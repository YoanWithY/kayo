import { AbstractPipeline, fragmentEntryPoint, vertexEntryPoint } from "../Material/AbstractPipeline";
import { Project } from "../project/Project";
import shaderCode from "../../wgsl/resolveFirst.wgsl?raw";
import { resolveShader } from "./Shader";
import { gpuDevice } from "../GPUX";

export class ResolvePipeline extends AbstractPipeline {
	vertexEntryPoint = vertexEntryPoint;
	fragmentEntryPoint = fragmentEntryPoint;
	gpuPipeline: GPURenderPipeline;
	readonly isDisplayOutputPipeline = false;
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
	depthStencilFormat: GPUTextureFormat = "depth16unorm";
	depthCompare: GPUCompareFunction;
	depthWriteEnabled: boolean;
	project: Project;

	constructor(project: Project, label: string, textureFormat: GPUTextureFormat, vectorFormat: string, vectorSelector: "x" | "xy" | "xyz" | "xyzw") {
		super(label);
		this.project = project;
		this.shaderCode = shaderCode;
		this.preProzessedShaderCoder = resolveShader(this.shaderCode, { vectorFormat, vectorSelector });
		this.vertexConstants = {};
		this.vertexBufferLayout = [];
		this.fragmentConstants = {};
		this.topology = "triangle-strip";
		this.cullMode = "none";
		this.depthCompare = "always";
		this.depthWriteEnabled = false;
		this.fragmentTargets = [{ format: textureFormat }];

		this.shaderModule = gpuDevice.createShaderModule(
			{
				label: `${label} shader module`,
				code: this.preProzessedShaderCoder,
				compilationHints: [{ entryPoint: vertexEntryPoint }, { entryPoint: fragmentEntryPoint }]
			});
		this.gpuPipeline = this.buildPipeline();
	}

	createPipelineLayout(): GPUPipelineLayout | "auto" {
		return gpuDevice.createPipelineLayout({
			label: "r16u Resolve Pipeline Layout",
			bindGroupLayouts: [this.project.renderer.r16ResolveBindGroupLayout],
		});
	}

	protected createDepthStencilState(): GPUDepthStencilState | undefined {
		return undefined;
	}
}
import { AbstractPipeline, fragmentEntryPoint, vertexEntryPoint } from "../Material/AbstractPipeline";
import { Project } from "../project/Project";
import shaderCode from "../../wgsl/compositing.wgsl?raw";
import { resolveShader } from "./Shader";
import { gpuDevice } from "../GPUX";

export class CompositingPipeline extends AbstractPipeline {
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

	constructor(project: Project, label: string) {
		super(label);
		this.project = project;
		this.shaderCode = shaderCode;
		this.preProzessedShaderCoder = resolveShader(this.shaderCode);
		this.vertexConstants = {};
		this.vertexBufferLayout = [];
		this.fragmentConstants = project.getTargetColorspaceConstants();
		this.topology = "triangle-strip";
		this.cullMode = "none";
		this.depthCompare = "always";
		this.depthWriteEnabled = false;
		this.fragmentTargets = [{ format: project.getSwapChainFormat() }];
		this.fragmentTargets[0].blend = {
			color: {
				srcFactor: "src-alpha",
				dstFactor: "one-minus-src-alpha",
				operation: "add"
			},
			alpha: {
				srcFactor: "zero",
				dstFactor: "one",
				operation: "add"
			}
		}

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
			label: "Composing Pipeline Layout",
			bindGroupLayouts: [this.project.renderer.compositingBindGroupLayout],
		});
	}

	protected createDepthStencilState(): GPUDepthStencilState | undefined {
		return undefined;
	}
}
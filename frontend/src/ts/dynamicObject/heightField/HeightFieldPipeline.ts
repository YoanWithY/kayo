import { gpuDevice } from "../../GPUX";
import { fragmentEntryPoint, AbstractPipeline, vertexEntryPoint } from "../../Material/AbstractPipeline";
import staticShaderCode from "./heightField.wgsl?raw";
import { resolveShader } from "../../rendering/Shader";
import Renderer from "../../rendering/Renderer";
import { Project } from "../../project/Project";
import { sunBindGroupLayout } from "../../lights/SunLight";

export const heightFieldDataLayout = gpuDevice.createBindGroupLayout(
	{
		label: "height field data bind group layout",
		entries:
			[
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer:
					{
						type: "uniform"
					}
				},
				{
					binding: 1,
					visibility: GPUShaderStage.VERTEX,
					texture:
					{
						multisampled: false,
						sampleType: "unfilterable-float",
						viewDimension: "2d"
					}
				}
			]
	});

export const heightFieldComputeBindGroupLayout = gpuDevice.createBindGroupLayout(
	{
		label: "height field compute bind group layout",
		entries:
			[
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					buffer:
					{
						type: "uniform"
					}
				},
				{
					binding: 1,
					visibility: GPUShaderStage.COMPUTE,
					storageTexture:
					{
						access: "write-only",
						format: "rgba32float",
						viewDimension: "2d"
					}
				}
			]
	});

export class HeightFieldPipeline extends AbstractPipeline {
	vertexEntryPoint = vertexEntryPoint;
	fragmentEntryPoint = fragmentEntryPoint;
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
	project: Project;

	constructor(project: Project, label: string) {
		super(label);
		this.project = project;
		this.shaderCode = staticShaderCode;
		this.preProzessedShaderCoder = resolveShader(this.shaderCode);
		this.vertexConstants = {};
		this.vertexBufferLayout = [];
		this.fragmentConstants = project.getDisplayFragmentOutputConstants();
		this.topology = "triangle-strip";
		this.cullMode = "none";
		this.depthCompare = "less";
		this.depthWriteEnabled = true;
		this.depthStencilFormat = Renderer.getDepthStencilFormat();
		this.fragmentTargets = project.getFragmentTargets();

		this.shaderModule = gpuDevice.createShaderModule(
			{
				label: `${label} shader module`,
				code: this.preProzessedShaderCoder,
				compilationHints: [
					{ entryPoint: vertexEntryPoint },
					{ entryPoint: fragmentEntryPoint },
				]
			});
		this.gpuPipeline = this.buildPipeline();
	}

	createPipelineLayout(): GPUPipelineLayout | "auto" {
		const renderer = this.project.renderer;
		return gpuDevice.createPipelineLayout({
			label: "Height field pipeline layout",
			bindGroupLayouts: [renderer.bindGroup0Layout, renderer.bindGroupR3Layout, heightFieldDataLayout, sunBindGroupLayout],
		});
	}

}
import { gpuDevice } from "../GPUX";
import { AbstractPipeline } from "../Material/AbstractPipeline";
import { Project } from "../project/Project";
import Renderer from "../rendering/Renderer";
import { resolveShader } from "../rendering/Shader";
import staticShaderCode from "./minecraftOpaque.wgsl?raw";
import { ResourcePack } from "./ResourcePack";

export const minecraftBindgroup1Layout = gpuDevice.createBindGroupLayout(
	{
		label: "minecraft bind group 1 layout",
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
			]
	});

export const minecraftBindgroup2Layout = gpuDevice.createBindGroupLayout(
	{
		label: "minecraft bind group 2 layout",
		entries:
			[
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						multisampled: false,
						sampleType: "float",
						viewDimension: "2d-array"
					}
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: {
						type: "filtering"
					}
				}
			]
	});

export class MinecraftOpaquePipeline extends AbstractPipeline {
	vertexEntryPoint = "vertex_main";
	fragmentEntryPoint = "fragment_main";
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
	frontFace: GPUFrontFace = "ccw";
	project: Project;

	constructor(project: Project, label: string) {
		super(label);
		this.project = project;
		this.shaderCode = staticShaderCode;
		this.preProzessedShaderCoder = resolveShader(this.shaderCode);
		this.vertexConstants = {};
		this.vertexBufferLayout = [
			{
				arrayStride: 9 * 4,
				attributes: [
					{ shaderLocation: 0, offset: 0, format: "float32x3" },
					{ shaderLocation: 1, offset: 3 * 4, format: "float32x3" },
					{ shaderLocation: 2, offset: 6 * 4, format: "float32x3" },
				],
				stepMode: "instance"
			},
			{
				arrayStride: 6 * 4,
				attributes: [
					{ shaderLocation: 3, offset: 0, format: "float32x2" },
					{ shaderLocation: 4, offset: 2 * 4, format: "float32x2" },
					{ shaderLocation: 5, offset: 4 * 4, format: "float32x2" },
				],
				stepMode: "instance"
			},
			{
				arrayStride: 8,
				attributes: [
					{ shaderLocation: 6, offset: 0, format: "uint32" },
					{ shaderLocation: 7, offset: 4, format: "uint32" },
				],
				stepMode: "instance"
			}
		];
		this.fragmentConstants = project.getDisplayFragmentOutputConstants();
		this.topology = "triangle-strip";
		this.cullMode = "back";
		this.depthCompare = "less-equal";
		this.depthWriteEnabled = true;
		this.depthStencilFormat = Renderer.getDepthStencilFormat();
		this.fragmentTargets = project.getFragmentTargets();

		this.shaderModule = gpuDevice.createShaderModule(
			{
				label: `${label} shader module`,
				code: this.preProzessedShaderCoder,
				compilationHints: [
					{ entryPoint: this.vertexEntryPoint },
					{ entryPoint: this.fragmentEntryPoint },
				]
			});
		this.gpuPipeline = this.buildPipeline();
	}

	createPipelineLayout(): GPUPipelineLayout | "auto" {
		const renderer = this.project.renderer;
		return gpuDevice.createPipelineLayout({
			label: "Minecraft opaque pipeline layout",
			bindGroupLayouts: [renderer.bindGroup0Layout, minecraftBindgroup1Layout, minecraftBindgroup2Layout],
		});
	}

	static pipeline: MinecraftOpaquePipeline;
	static init(project: Project) {
		this.pipeline = new MinecraftOpaquePipeline(project, "Minecraft Opaque Pipeline");
	}

	static bindGroup2: GPUBindGroup;
	static setRessourcePack(res: ResourcePack) {
		this.bindGroup2 = gpuDevice.createBindGroup({
			label: "minecraft bind group 2",
			entries: [
				{
					binding: 0,
					resource: res.allBlockTextures.createView({ arrayLayerCount: res.allBlockTextures.depthOrArrayLayers }),
				},
				{
					binding: 1, resource: gpuDevice.createSampler(
						{
							label: "all block texture array",
							addressModeU: "clamp-to-edge",
							addressModeV: "clamp-to-edge",
							magFilter: "linear",
							minFilter: "linear",
							mipmapFilter: "linear",
							maxAnisotropy: 16
						}
					)
				}
			],
			layout: minecraftBindgroup2Layout
		});
	}

}
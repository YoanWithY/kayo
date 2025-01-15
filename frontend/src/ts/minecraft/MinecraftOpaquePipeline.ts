import { AbstractDisplayOutputRenderingPipeline } from "../Material/AbstractRenderingPipeline";
import { Project } from "../project/Project";
import Renderer from "../rendering/Renderer";
import { resolveShader } from "../rendering/ShaderUtils";
import staticShaderCode from "./minecraftOpaque.wgsl?raw";

export class MinecraftOpaquePipeline extends AbstractDisplayOutputRenderingPipeline {
	project: Project;
	vertexEntryPoint = "vertex_main";
	fragmentEntryPoint = "fragment_main";
	gpuPipeline: GPURenderPipeline;
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
	static minecraftBindgroup1Layout: GPUBindGroupLayout;

	constructor(project: Project, label: string) {
		super(label);
		this.project = project;
		this.shaderCode = staticShaderCode;
		this.preProzessedShaderCoder = resolveShader(this.shaderCode);
		this.vertexConstants = {};
		this.multisample.alphaToCoverageEnabled = false;
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

		this.shaderModule = this.project.gpux.gpuDevice.createShaderModule(
			{
				label: `${label} shader module`,
				code: this.preProzessedShaderCoder,
				compilationHints: [
					{ entryPoint: this.vertexEntryPoint },
					{ entryPoint: this.fragmentEntryPoint },
				]
			});
		this.gpuPipeline = this.buildPipeline(this.project.gpux.gpuDevice);
	}

	createPipelineLayout(): GPUPipelineLayout | "auto" {
		const renderer = this.project.renderer;
		return this.project.gpux.gpuDevice.createPipelineLayout({
			label: "Minecraft opaque pipeline layout",
			bindGroupLayouts: [renderer.bindGroup0Layout, MinecraftOpaquePipeline.minecraftBindgroup1Layout],
		});
	}

	static pipeline: MinecraftOpaquePipeline;
	static init(project: Project) {
		this.minecraftBindgroup1Layout = project.gpux.gpuDevice.createBindGroupLayout(
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
		this.pipeline = new MinecraftOpaquePipeline(project, "Minecraft Opaque Pipeline");
	}

}
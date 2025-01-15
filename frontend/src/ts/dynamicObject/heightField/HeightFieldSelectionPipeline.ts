import { AbstractRenderingPipeline, vertexGeometryEntryPoint, fragmentSelectionEntryPoint } from "../../Material/AbstractRenderingPipeline";
import staticShaderCode from "./heightField.wgsl?raw";
import { resolveShader } from "../../rendering/ShaderUtils";
import Renderer from "../../rendering/Renderer";
import { Project } from "../../project/Project";
import { HeightFieldPipeline } from "./HeightFieldPipeline";

export class HeightFieldSelectionPipeline extends AbstractRenderingPipeline {
	vertexEntryPoint = vertexGeometryEntryPoint;
	fragmentEntryPoint = fragmentSelectionEntryPoint;
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
	project: Project;

	constructor(project: Project, label: string) {
		super(label);
		this.project = project;
		this.shaderCode = staticShaderCode;
		this.preProzessedShaderCoder = resolveShader(this.shaderCode);
		this.vertexConstants = {};
		this.vertexBufferLayout = [];
		this.fragmentConstants = {};
		this.topology = "triangle-strip";
		this.cullMode = "none";
		this.depthCompare = "less";
		this.depthWriteEnabled = true;
		this.depthStencilFormat = Renderer.getDepthStencilFormat();
		this.fragmentTargets = [{ format: "r8uint" }];

		this.shaderModule = this.project.gpux.gpuDevice.createShaderModule(
			{
				label: `${label} shader module`,
				code: this.preProzessedShaderCoder,
				compilationHints: [
					{ entryPoint: vertexGeometryEntryPoint },
					{ entryPoint: fragmentSelectionEntryPoint },
				]
			});
		this.gpuPipeline = this.buildPipeline(this.project.gpux.gpuDevice);
	}

	createPipelineLayout(): GPUPipelineLayout | "auto" {
		const renderer = this.project.renderer;
		return this.project.gpux.gpuDevice.createPipelineLayout({
			label: "Height field selection pipeline layout",
			bindGroupLayouts: [renderer.bindGroup0Layout, renderer.bindGroupR3Layout, HeightFieldPipeline.heightFieldDataLayout],
		});
	}

}
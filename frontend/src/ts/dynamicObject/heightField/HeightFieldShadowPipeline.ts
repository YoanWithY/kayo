import { AbstractRenderingPipeline, vertexGeometryEntryPoint } from "../../Material/AbstractRenderingPipeline";
import staticShaderCode from "./heightField.wgsl?raw";
import { resolveShader } from "../../rendering/ShaderUtils";
import { Project } from "../../project/Project";
import { HeightFieldPipeline } from "./HeightFieldPipeline";

export class HeightFieldShadowPipeline extends AbstractRenderingPipeline {
	vertexEntryPoint = vertexGeometryEntryPoint;
	fragmentEntryPoint = undefined;
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
		this.depthStencilFormat = "depth24plus";
		this.fragmentTargets = [];

		this.shaderModule = this.project.gpux.gpuDevice.createShaderModule(
			{
				label: `${label} shader module`,
				code: this.preProzessedShaderCoder,
				compilationHints: [
					{ entryPoint: vertexGeometryEntryPoint },
				]
			});
		this.gpuPipeline = this.buildPipeline(this.project.gpux.gpuDevice);
	}

	createPipelineLayout(): GPUPipelineLayout | "auto" {
		const renderer = this.project.renderer;
		return this.project.gpux.gpuDevice.createPipelineLayout({
			label: "Height field shadow pipeline layout",
			bindGroupLayouts: [renderer.bindGroup0Layout, renderer.bindGroupR3Layout, HeightFieldPipeline.heightFieldDataLayout],
		});
	}
}
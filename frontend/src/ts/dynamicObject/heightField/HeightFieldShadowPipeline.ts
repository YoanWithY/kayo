import { gpuDevice } from "../../GPUX";
import { AbstractPipeline, vertexGeometryEntryPoint } from "../../Material/AbstractPipeline";
import staticShaderCode from "./heightField.wgsl?raw";
import { resolveShader } from "../../rendering/Shader";
import { Project } from "../../project/Project";
import { heightFieldDataLayout } from "./HeightFieldPipeline";

export class HeightFieldShadowPipeline extends AbstractPipeline {
	vertexEntryPoint = vertexGeometryEntryPoint;
	fragmentEntryPoint = undefined;
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

		this.shaderModule = gpuDevice.createShaderModule(
			{
				label: `${label} shader module`,
				code: this.preProzessedShaderCoder,
				compilationHints: [
					{ entryPoint: vertexGeometryEntryPoint },
				]
			});
		this.gpuPipeline = this.buildPipeline();
	}

	createPipelineLayout(): GPUPipelineLayout | "auto" {
		const renderer = this.project.renderer;
		return gpuDevice.createPipelineLayout({
			label: "Height field shadow pipeline layout",
			bindGroupLayouts: [renderer.bindGroup0Layout, renderer.bindGroupR3Layout, heightFieldDataLayout],
		});
	}
}
import { AbstractPipeline, fragmentEntryPoint, vertexEntryPoint } from "../Material/AbstractPipeline";
import staticShaderCode from "../../wgsl/debug/grid.wgsl?raw"
import Renderer from "../rendering/Renderer";
import { resolveIncludes } from "../rendering/Shader";
import { gpuDevice } from "../GPUX";

export class GridPipeline extends AbstractPipeline {
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

	constructor(bindGroup0Layout: GPUBindGroupLayout) {
		super("Grid Pipeline");
		this.bindGroup0Layout = bindGroup0Layout;
		this.shaderCode = staticShaderCode;
		this.preProzessedShaderCoder = resolveIncludes(this.shaderCode);
		this.vertexConstants = {};
		this.vertexBufferLayout = [];
		this.fragmentConstants = Renderer.getDisplayFragmentOutputConstantsCopy();
		this.topology = "triangle-strip";
		this.cullMode = "none";
		this.depthCompare = "less";
		this.depthWriteEnabled = false;
		this.depthStencilFormat = Renderer.getDepthStencilFormat();
		this.fragmentTargets = Renderer.getFragmentTargets();
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
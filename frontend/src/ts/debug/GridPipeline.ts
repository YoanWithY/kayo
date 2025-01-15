import { AbstractMSAwareRenderingPipeline, fragmentEntryPoint, vertexEntryPoint } from "../Material/AbstractRenderingPipeline";
import staticShaderCode from "./grid.wgsl?raw"
import Renderer from "../rendering/Renderer";
import { resolveShader } from "../rendering/ShaderUtils";
import { Project } from "../project/Project";
import Renderable from "../Material/Renderable";

export class GridPipeline extends AbstractMSAwareRenderingPipeline implements Renderable {
	project: Project;
	vertexEntryPoint = vertexEntryPoint;
	fragmentEntryPoint = fragmentEntryPoint;
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
	stripIndexFormat?: GPUIndexFormat | undefined;
	depthStencilFormat: GPUTextureFormat;
	depthCompare: GPUCompareFunction;
	depthWriteEnabled: boolean;
	bindGroup0Layout: GPUBindGroupLayout;
	vertexBuffer: GPUBuffer;
	vertices: number;

	private static pushRotation(arr: number[], outer: number, inner: number) {
		arr.push(
			-outer, -outer,
			-inner, -inner,
			-outer, outer,
			-inner, inner,
			outer, outer,
			inner, inner,
			outer, -outer,
			inner, -inner,
			-outer, -outer,
			-inner, -inner,
		);
	}
	constructor(project: Project) {
		super("Grid Pipeline");
		this.bindGroup0Layout = project.renderer.bindGroup0Layout;
		this.shaderCode = staticShaderCode;
		this.preProzessedShaderCoder = resolveShader(this.shaderCode);
		this.vertexConstants = {};
		this.vertexBufferLayout = [{arrayStride: 2 * 4, attributes: [{format: "float32x2", offset: 0, shaderLocation: 0}]}];
		this.fragmentConstants = {};
		this.topology = "triangle-strip";
		this.cullMode = "none";
		this.depthCompare = "less-equal";
		this.depthWriteEnabled = false;
		this.depthStencilFormat = Renderer.getDepthStencilFormat();
		this.fragmentTargets = [{
			format: "rgba8unorm",
		}];
		this.project = project;
		

		this.shaderModule = this.project.gpux.gpuDevice.createShaderModule(
			{
				code: this.preProzessedShaderCoder,
				compilationHints: [{ entryPoint: vertexEntryPoint }, { entryPoint: fragmentEntryPoint }]
			});
		this.gpuPipeline = this.buildPipeline(this.project.gpux.gpuDevice);

		const vertexData: number[] = [];
		GridPipeline.pushRotation(vertexData, 10000, 1000);
		GridPipeline.pushRotation(vertexData, 1000, 100);
		GridPipeline.pushRotation(vertexData, 100, 10);
		vertexData.push(
			-10, -10,
			-10, 10,
			10, -10,
			10, 10
		);
		
		this.vertexBuffer = this.project.gpux.gpuDevice.createBuffer({
			size: vertexData.length * 4,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});
		new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData);
		this.vertexBuffer.unmap();
		this.vertices = vertexData.length / 2;
		this.vertexBuffer
	}

	createPipelineLayout(): GPUPipelineLayout | "auto" {
		return this.project.gpux.gpuDevice.createPipelineLayout({
			label: "Debug Grid Pipeline Layout",
			bindGroupLayouts: [this.bindGroup0Layout],
		});
	}

	recordForwardRendering(renderPassEncoder: GPURenderPassEncoder): void {
		renderPassEncoder.setPipeline(this.gpuPipeline);
		renderPassEncoder.setVertexBuffer(0, this.vertexBuffer)
		renderPassEncoder.draw(this.vertices);
	};

}
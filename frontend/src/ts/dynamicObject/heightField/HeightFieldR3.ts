import { heightFieldComputeBindGroupLayout, heightFieldDataLayout, HeightFieldPipeline } from "./HeightFieldPipeline";
import { Project } from "../../project/Project";
import R3Object from "../../project/R3Object";
import { HeightFieldSelectionPipeline } from "./HeightFieldSelectionPipeline";
import { gpuDevice } from "../../GPUX";
import { resolveShader } from "../../rendering/Shader";
import heightFieldComputeCode from "./heightFieldCompute.wgsl?raw";

export default class HeightFieldR3 extends R3Object {
	pipeline: HeightFieldPipeline;
	selectionPipeline: HeightFieldSelectionPipeline;
	computePipeline: GPUComputePipeline;
	private _xVerts: number;
	private _yVerts: number;
	cacheTexture: GPUTexture;
	dataBuffer: GPUBuffer;
	dataBindGroup: GPUBindGroup;
	computeBindGroup: GPUBindGroup;
	constructor(project: Project, heightFunction: string, xVerts: number = 1000, yVerts: number = 1000) {
		super(project);
		this._xVerts = xVerts;
		this._yVerts = yVerts;
		this.cacheTexture = gpuDevice.createTexture({
			label: "Cache Texture for height field",
			format: "rgba32float",
			dimension: "2d",
			size: [xVerts, yVerts, 1],
			usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
		});
		this.pipeline = new HeightFieldPipeline(project, "Height Field Pipeline");
		this.selectionPipeline = new HeightFieldSelectionPipeline(project, "Height Field Selection Pieline");
		this.dataBuffer = gpuDevice.createBuffer({
			label: "height field data buffer",
			size: 10 * 4,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});
		this.floatData[0] = -10;
		this.floatData[1] = -10;
		this.floatData[2] = 20;
		this.floatData[3] = 20;
		this.floatData[4] = -10;
		this.floatData[5] = -10;
		this.floatData[6] = 20;
		this.floatData[7] = 20;
		this.uintData[0] = xVerts;
		this.uintData[1] = yVerts;
		gpuDevice.queue.writeBuffer(this.dataBuffer, 0, this.floatData);
		gpuDevice.queue.writeBuffer(this.dataBuffer, this.floatData.byteLength, this.uintData);
		this.dataBindGroup = gpuDevice.createBindGroup(
			{
				label: "height field data bind group",
				layout: heightFieldDataLayout,
				entries:
					[
						{
							binding: 0,
							resource:
							{
								label: "height field data buffer binding",
								buffer: this.dataBuffer
							}
						},
						{
							binding: 1,
							resource: this.cacheTexture.createView()
						}
					]
			});
		this.computeBindGroup = gpuDevice.createBindGroup(
			{
				label: "height field compute bind group",
				layout: heightFieldComputeBindGroupLayout,
				entries:
					[
						{
							binding: 0,
							resource:
							{
								label: "height field data buffer binding",
								buffer: this.dataBuffer
							}
						},
						{
							binding: 1,
							resource: this.cacheTexture.createView()
						}
					]
			});
		const computeModule = gpuDevice.createShaderModule({
			label: "height field compute shader module",
			code: resolveShader(heightFieldComputeCode, { heightCode: heightFunction }),
			compilationHints: [{ entryPoint: "computeHeight" }],
		})
		const computePipelineLayout = gpuDevice.createPipelineLayout({
			label: "height field compute pipeline layout",
			bindGroupLayouts: [project.renderer.bindGroup0Layout, heightFieldComputeBindGroupLayout],
		})
		this.computePipeline = gpuDevice.createComputePipeline(
			{
				label: "Height field compute pipeline",
				layout: computePipelineLayout,
				compute: {
					module: computeModule
				}
			});
	}

	getVerts(): number {
		return this._xVerts * this._yVerts + this._xVerts * (this._yVerts - 2) + 2 * this._yVerts - 2;
	}

	render(renderPassEncoder: GPURenderPassEncoder): void {
		renderPassEncoder.setPipeline(this.pipeline.gpuPipeline);
		this.updateUniforms();
		renderPassEncoder.setBindGroup(1, this.defaultBindGroup);
		renderPassEncoder.setBindGroup(2, this.dataBindGroup);
		renderPassEncoder.draw(this.getVerts());
	}

	renderSelection(renderPassEncoder: GPURenderPassEncoder): void {
		renderPassEncoder.setPipeline(this.selectionPipeline.gpuPipeline);
		this.updateUniforms();
		renderPassEncoder.setBindGroup(1, this.defaultBindGroup);
		renderPassEncoder.setBindGroup(2, this.dataBindGroup);
		renderPassEncoder.draw(this.getVerts());
	}

	floatData = new Float32Array(8);
	uintData = new Uint32Array(2);
	compute(computePassEncoder: GPUComputePassEncoder) {
		computePassEncoder.setPipeline(this.computePipeline);
		computePassEncoder.setBindGroup(1, this.computeBindGroup);
		computePassEncoder.dispatchWorkgroups(Math.ceil(this._xVerts / 8), Math.ceil(this._xVerts / 8), 1);
	}
}
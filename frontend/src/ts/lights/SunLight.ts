import mat4 from "../math/mat4";
import { Project } from "../project/Project";
import R3Object from "../project/R3Object";
import OrthographicProjection from "../projection/OrthographicProjection";
import Projection from "../projection/Projection";
import Camera from "../Viewport/Camera";

export class SunLight extends R3Object implements Camera {
	public projection: OrthographicProjection;
	public shadowMap: GPUTexture;
	public renderPass: GPURenderPassDescriptor;
	public resolution: number;
	public bindGroup: GPUBindGroup;
	public buffer: GPUBuffer;
	public project: Project;
	public static sunBindGroupLayout: any;

	public static init(project: Project) {
		const gpuDevice = project.gpux.gpuDevice;
		this.sunBindGroupLayout = gpuDevice.createBindGroupLayout({
			label: "sun bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: { type: "uniform" },
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						multisampled: false,
						sampleType: "depth",
						viewDimension: "2d",
					},
				},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: {
						type: "comparison",
					},
				},
			],
		});
	}

	public constructor(project: Project, rangeWidth = 1000, distance = 1000, resolution = 4096) {
		super(project);
		this.project = project;
		this.projection = new OrthographicProjection(rangeWidth, 0, distance);
		this.resolution = resolution;
		const gpuDevice = project.gpux.gpuDevice;
		this.shadowMap = gpuDevice.createTexture({
			label: "Sun Light shadow map",
			format: "depth24plus",
			size: [resolution, resolution, 1],
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
		});
		this.renderPass = {
			label: "sun shadow render pass descriptor",
			colorAttachments: [],
			depthStencilAttachment: {
				view: this.shadowMap.createView(),
				depthClearValue: 1.0,
				depthLoadOp: "clear",
				depthStoreOp: "store",
			},
		};
		this.buffer = gpuDevice.createBuffer({
			label: "sun buffer",
			size: 20 * 4,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
		});
		this.bindGroup = gpuDevice.createBindGroup({
			label: "sun bind group",
			layout: SunLight.sunBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: { buffer: this.buffer },
				},
				{
					binding: 1,
					resource: this.shadowMap.createView(),
				},
				{
					binding: 2,
					resource: gpuDevice.createSampler({
						compare: "less-equal",
						magFilter: "linear",
					}),
				},
			],
		});
	}
	public getProjection(): Projection {
		return this.projection;
	}
	public getViewMatrix(): mat4 {
		return this.transformationStack.getInverseTransformationMatrix();
	}
	public render(_: GPURenderPassEncoder): void {}
	public renderSelection(_: GPURenderPassEncoder): void {}
	public renderDepth(_: GPURenderPassEncoder): void {}
	public floatData = new Float32Array(20);
	public updateSunUniforms(gpuDevice: GPUDevice) {
		const mat = this.transformationStack.getTransformationMatrix();
		this.projection
			.getProjectionMatrix(this.resolution, this.resolution)
			.mult(this.getViewMatrix())
			.pushInFloat32ArrayColumnMajor(this.floatData);
		this.floatData.set([mat[2], mat[6], mat[10], 1], 16);
		gpuDevice.queue.writeBuffer(this.buffer, 0, this.floatData);
	}
}

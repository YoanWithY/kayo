import { GPUX } from "../GPUX";
import { fragmentEntryPoint, vertexEntryPoint } from "../rendering/AbstractRenderingPipeline";
import { resolveShader } from "../rendering/ShaderUtils";
import mipmapCode from "./mipmap.wgsl?raw";

export default class TextureUtils {
	private static mipMapPipelines: { [key: string]: GPURenderPipeline } = {};
	private static mipMapModule: GPUShaderModule;
	private static sampler: GPUSampler;
	private static gpuDevice: GPUDevice;
	public static init(gpux: GPUX) {
		this.gpuDevice = gpux.gpuDevice;
		this.mipMapModule = gpux.gpuDevice.createShaderModule({
			label: "mip map shader module",
			code: resolveShader(mipmapCode),
			compilationHints: [{ entryPoint: vertexEntryPoint }, { entryPoint: fragmentEntryPoint }],
		});
		this.sampler = gpux.gpuDevice.createSampler({ minFilter: "linear" });
	}

	public static getResolutionOfMip(resolutionAtLevel0: number, level: number) {
		return Math.max(1, Math.floor(resolutionAtLevel0 >> level));
	}

	/**
	 * @param width The width of the mip 0 texture in texels.
	 * @param height The height of the mip 0 texture in texels.
	 * @returns The number of mip levels for a full mip pyramid (including 0);
	 */
	public static getFullMipPyramidLevels(width: number, height: number = width) {
		return Math.floor(Math.log2(Math.max(width, height))) + 1;
	}

	public static getFirstAtlasedLevel(resolutionAtLevel0: number, largestAtlasMipSize: number): number {
		return Math.max(Math.ceil(Math.log2(resolutionAtLevel0 / largestAtlasMipSize)), 0);
	}

	public static generateMipMap(texture: GPUTexture) {
		if (!this.mipMapPipelines[texture.format]) {
			this.mipMapPipelines[texture.format] = this.gpuDevice.createRenderPipeline({
				layout: "auto",
				vertex: {
					module: this.mipMapModule,
				},
				fragment: {
					module: this.mipMapModule,
					targets: [{ format: texture.format }],
				},
				primitive: { topology: "triangle-strip" },
			});
		}

		const pipeline = this.mipMapPipelines[texture.format];

		const encoder = this.gpuDevice.createCommandEncoder({ label: "mip gen encoder" });
		let width = texture.width;
		let height = texture.height;
		let baseMipLevel = 0;

		while (width > 1 || height > 1) {
			width = Math.max(1, (width / 2) | 0);
			height = Math.max(1, (height / 2) | 0);

			const bindGroup = this.gpuDevice.createBindGroup({
				layout: pipeline.getBindGroupLayout(0),
				entries: [
					{
						binding: 0,
						resource: texture.createView({
							baseMipLevel: baseMipLevel,
							mipLevelCount: 1,
							baseArrayLayer: 0,
							dimension: "2d",
						}),
					},
					{ binding: 1, resource: this.sampler },
				],
			});
			baseMipLevel++;
			if (baseMipLevel >= texture.mipLevelCount) {
				width = height = 0;
				continue;
			}

			const renderPassDescriptor: GPURenderPassDescriptor = {
				label: "mip render pass",
				colorAttachments: [
					{
						view: texture.createView({
							baseMipLevel: baseMipLevel,
							mipLevelCount: 1,
							baseArrayLayer: 0,
							dimension: "2d",
						}),
						loadOp: "clear",
						storeOp: "store",
						clearValue: [1, 1, 1, 1],
					},
				],
			};

			const pass = encoder.beginRenderPass(renderPassDescriptor);
			pass.setViewport(0, 0, width, height, 0, 1);
			pass.setPipeline(pipeline);
			pass.setBindGroup(0, bindGroup);
			pass.draw(4);
			pass.end();
		}
		this.gpuDevice.queue.submit([encoder.finish()]);
	}
}

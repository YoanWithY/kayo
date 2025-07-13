import { GPUX } from "../GPUX";
import TextureUtils from "./TextureUtils";
import { IndirectionIndexTable } from "./IndirectionIndexTable";
import { IndirectionTableAtlas } from "./IndirectionTableAtlas";
import { PhysicalTexture } from "./PhysicalTexture";
import { VirtualTexture2D, VirtualTextureSamplingDescriptor } from "./VirtualTexture2D";
import { CPUTexture } from "./CPUTexture";

export class VirtualTextureSystem {
	public gpux: GPUX;
	public largestAtlasedMipSize: number; // must be power of two
	public numberOfMipsInMipAtlas: number;

	public physicalTexture: PhysicalTexture;
	public indirectionTableAtlas: IndirectionTableAtlas;
	public indirectionIndexTable: IndirectionIndexTable;
	public bindGroupEntries: GPUBindGroupEntry[];

	public atlasOffsets: [number, number][] = [
		[16, 16],
		[112, 16],
		[112, 80],
		[16, 128],
		[56, 128],
		[96, 128],
		[136, 128],
	];
	public constructor(gpux: GPUX) {
		// Construction order is relevant!
		this.gpux = gpux;
		this.largestAtlasedMipSize = 64;
		this.numberOfMipsInMipAtlas = TextureUtils.getFullMipPyramidLevels(this.largestAtlasedMipSize);

		this.physicalTexture = new PhysicalTexture(this, gpux);
		this.indirectionTableAtlas = new IndirectionTableAtlas(this, gpux);
		this.indirectionIndexTable = new IndirectionIndexTable(this, gpux);

		const device = gpux.gpuDevice;
		this.bindGroupEntries = [
			{ binding: 128, resource: this.indirectionIndexTable.imageInfoGPUTexture.createView() },
			{ binding: 129, resource: this.indirectionIndexTable.indirectionIndexTableGPUTexture.createView() },
			{ binding: 130, resource: this.indirectionTableAtlas.gpuTexture.createView({ dimension: "2d-array" }) },
			{ binding: 131, resource: this.physicalTexture.gpuTexture.createView() },
			{
				binding: 132,
				resource: device.createSampler({
					label: "SVT Sampler: mag near, min near",
					mipmapFilter: "nearest",
					magFilter: "nearest",
					minFilter: "nearest",
					addressModeU: "clamp-to-edge",
					addressModeV: "clamp-to-edge",
					maxAnisotropy: 1,
				}),
			},
			{
				binding: 133,
				resource: device.createSampler({
					label: "SVT Sampler: mag near, min near",
					mipmapFilter: "nearest",
					magFilter: "nearest",
					minFilter: "linear",
					addressModeU: "clamp-to-edge",
					addressModeV: "clamp-to-edge",
					maxAnisotropy: 1,
				}),
			},
			{
				binding: 134,
				resource: device.createSampler({
					label: "SVT Sampler: mag near, min near",
					mipmapFilter: "nearest",
					magFilter: "linear",
					minFilter: "nearest",
					addressModeU: "clamp-to-edge",
					addressModeV: "clamp-to-edge",
					maxAnisotropy: 1,
				}),
			},
			{
				binding: 135,
				resource: device.createSampler({
					label: "SVT Sampler: mag near, min near",
					mipmapFilter: "nearest",
					magFilter: "linear",
					minFilter: "linear",
					addressModeU: "clamp-to-edge",
					addressModeV: "clamp-to-edge",
					maxAnisotropy: 1,
				}),
			},
			{
				binding: 136,
				resource: device.createSampler({
					label: "SVT Sampler: mag near, min near",
					mipmapFilter: "linear",
					magFilter: "nearest",
					minFilter: "nearest",
					addressModeU: "clamp-to-edge",
					addressModeV: "clamp-to-edge",
					maxAnisotropy: 1,
				}),
			},
			{
				binding: 137,
				resource: device.createSampler({
					label: "SVT Sampler: mag near, min near",
					mipmapFilter: "linear",
					magFilter: "nearest",
					minFilter: "linear",
					addressModeU: "clamp-to-edge",
					addressModeV: "clamp-to-edge",
					maxAnisotropy: 1,
				}),
			},
			{
				binding: 138,
				resource: device.createSampler({
					label: "SVT Sampler: mag near, min near",
					mipmapFilter: "linear",
					magFilter: "linear",
					minFilter: "nearest",
					addressModeU: "clamp-to-edge",
					addressModeV: "clamp-to-edge",
					maxAnisotropy: 1,
				}),
			},
			{
				binding: 139,
				resource: device.createSampler({
					label: "SVT Sampler: mag near, min near",
					mipmapFilter: "linear",
					magFilter: "linear",
					minFilter: "linear",
					addressModeU: "clamp-to-edge",
					addressModeV: "clamp-to-edge",
					maxAnisotropy: 1,
				}),
			},
			{
				binding: 140,
				resource: device.createSampler({
					label: "SVT Sampler: mag near, min near",
					mipmapFilter: "linear",
					magFilter: "linear",
					minFilter: "linear",
					addressModeU: "clamp-to-edge",
					addressModeV: "clamp-to-edge",
					maxAnisotropy: 16,
				}),
			}, // must be changed in virtualTexture.wgsl
		];
	}

	public static readonly bindGroupEntries: GPUBindGroupLayoutEntry[] = [
		{ binding: 128, visibility: GPUShaderStage.FRAGMENT, texture: { viewDimension: "2d", sampleType: "uint" } },
		{ binding: 129, visibility: GPUShaderStage.FRAGMENT, texture: { viewDimension: "2d", sampleType: "uint" } },
		{
			binding: 130,
			visibility: GPUShaderStage.FRAGMENT,
			texture: { viewDimension: "2d-array", sampleType: "uint" },
		},
		{
			binding: 131,
			visibility: GPUShaderStage.FRAGMENT,
			texture: { viewDimension: "2d-array", sampleType: "float" },
		},
		{ binding: 132, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
		{ binding: 133, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
		{ binding: 134, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
		{ binding: 135, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
		{ binding: 136, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
		{ binding: 137, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
		{ binding: 138, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
		{ binding: 139, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
		{ binding: 140, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
	];

	public generateMipAtlas(image: ImageBitmap, sampling: VirtualTextureSamplingDescriptor): CPUTexture {
		const t = new CPUTexture(image.width, image.height, 0, TextureUtils.getImagePixels(image));
		const atlas = new CPUTexture(this.physicalTexture.physicalTileSize, this.physicalTexture.physicalTileSize, 1);
		const firstAtlasIndex =
			this.numberOfMipsInMipAtlas - TextureUtils.getFullMipPyramidLevels(image.width, image.height);
		let l = 0;
		for (let i = firstAtlasIndex; i < this.numberOfMipsInMipAtlas; i++) {
			atlas.copyFrom(
				t,
				l,
				this.atlasOffsets[i][0],
				this.atlasOffsets[i][1],
				0,
				this.physicalTexture.border,
				sampling,
			);
			l++;
		}
		return atlas;
	}

	public allocateVirtualTexture(
		uid: string,
		width: number,
		height: number,
		uAddressMode: GPUAddressMode = "clamp-to-edge",
		vAddressMode: GPUAddressMode = "clamp-to-edge",
		mipmapFilter: GPUMipmapFilterMode = "linear",
		magFilter: GPUFilterMode = "linear",
		minFilter: GPUFilterMode = "linear",
		useAnisotropicFiltering: boolean = true,
	): VirtualTexture2D | undefined {
		const vid = this.indirectionIndexTable.allocateVirtualTextureID();
		if (vid === undefined) {
			console.error("Allocation of virtual texture failed!");
			return undefined;
		}

		const virtualTexture = new VirtualTexture2D(
			this,
			uid,
			vid,
			width,
			height,
			uAddressMode,
			vAddressMode,
			magFilter,
			minFilter,
			mipmapFilter,
			useAnisotropicFiltering,
		);

		if (virtualTexture.isMipAtlasedOnly()) {
			this.indirectionIndexTable.setDataOf(virtualTexture, true);
			return virtualTexture;
		}

		console.error("bigger texture not yet supported.");
		this.indirectionIndexTable.freeVirtualTextureID(vid);
		return undefined;
	}
}

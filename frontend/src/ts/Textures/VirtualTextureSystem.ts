import { GPUX } from "../GPUX";
import TextureUtils from "./TextureUtils";
import { TextureSVTData as TextureSVTData } from "./TextureSVTData";
import { IndirectionTableAtlas } from "./IndirectionTableAtlas";
import { PhysicalTexture } from "./PhysicalTexture";
import { VirtualTexture2D, VirtualTextureSamplingDescriptor } from "./VirtualTexture2D";
import { CPUTexture } from "./CPUTexture";

export class VirtualTextureSystem {
	public gpux: GPUX;
	public largestAtlasedMipSize: number; // must be power of two
	public numberOfMipsInMipAtlas: number;

	/**
	 * The logical image size (= width = height) of a tile in texels.
	 */
	private _logicalTileSize = 128;
	/**
	 * Border per side of each tile in texels.
	 */
	private _tileBorder = 16;
	/**
	 * The physical image size (= width = height) of a tile in texels.
	 */
	private _physicalTileSize = this._logicalTileSize + 2 * this._tileBorder; // 2 pixels padding at each side for mip maps and liner filtering.
	/**
	 * The number of layers of the physical texture. This can be chose based on preference.
	 */
	private _physicalLayers = 4;
	/**
	 * The size (= width = height) of the physical texture in texels. This will be set to approx. maxTextureDimension2D.
	 */
	private _physicalLayerSize: number;
	/**
	 * The number of tiles in one dimension of the physical texture.
	 */
	private _tilesPerDimension: number;
	/**
	 * The number of tiles one layer of the physical texture can store.
	 */
	private _tilesPerLayer: number;
	/**
	 * The total number of tiles the physical texture can store.
	 */
	private _tilesInTotal: number;

	public physicalTexture: PhysicalTexture;
	public indirectionTableAtlas: IndirectionTableAtlas;
	public textureSVTData: TextureSVTData;
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

		if (Math.floor(gpux.gpuDevice.limits.maxTextureDimension2D / this._physicalTileSize) > 256)
			this._physicalLayerSize = this._physicalTileSize * 256;
		else this._physicalLayerSize = gpux.gpuDevice.limits.maxTextureDimension2D;
		this._tilesPerDimension = Math.floor(this._physicalLayerSize / this._physicalTileSize);
		this._tilesPerLayer = this._tilesPerDimension * this._tilesPerDimension;
		this._tilesInTotal = this._tilesPerLayer * this._physicalLayers;

		this.physicalTexture = new PhysicalTexture(this, gpux);
		this.indirectionTableAtlas = new IndirectionTableAtlas(this, gpux);
		this.textureSVTData = new TextureSVTData(this, gpux);

		const device = gpux.gpuDevice;
		this.bindGroupEntries = [
			{ binding: 128, resource: this.textureSVTData.gpuBuffer },
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

	public get logicalTileSize() {
		return this._logicalTileSize;
	}

	public get tileBorder() {
		return this._tileBorder;
	}

	public get physicalTileSize() {
		return this._physicalTileSize;
	}

	public get physicalLayerSize() {
		return this._physicalLayerSize;
	}

	public get layers() {
		return this._physicalLayers;
	}

	public get tilesPerDimension() {
		return this._tilesPerDimension;
	}

	public get tilesPerLayer() {
		return this._tilesPerLayer;
	}

	public get tilesInTotal() {
		return this._tilesInTotal;
	}

	public static readonly bindGroupLayoutEntries: GPUBindGroupLayoutEntry[] = [
		{
			binding: 128,
			visibility: GPUShaderStage.FRAGMENT,
			buffer: { type: "read-only-storage", hasDynamicOffset: false },
		},
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
		const atlas = new CPUTexture(this._physicalTileSize, this._physicalTileSize, 1);
		const firstAtlasIndex =
			this.numberOfMipsInMipAtlas - TextureUtils.getFullMipPyramidLevels(image.width, image.height);
		let l = 0;
		for (let i = firstAtlasIndex; i < this.numberOfMipsInMipAtlas; i++) {
			atlas.copyFrom(t, l, this.atlasOffsets[i][0], this.atlasOffsets[i][1], 0, this.tileBorder, sampling);
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
		const vid = this.textureSVTData.allocateVirtualTextureID();
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
			this.textureSVTData.setDataOf(virtualTexture, true);
			return virtualTexture;
		}

		console.error("bigger texture not yet supported.");
		this.textureSVTData.freeVirtualTextureID(vid);
		return undefined;
	}
}

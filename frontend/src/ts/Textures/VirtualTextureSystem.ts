import { GPUX } from "../GPUX";
import { TextureSVTData as TextureSVTData } from "./TextureSVTData";
import { IndirectionTableAtlas } from "./IndirectionTableAtlas";
import { PhysicalTexture } from "./PhysicalTexture";
import { VirtualTexture2D } from "./VirtualTexture2D";
import WASMX from "../WASMX";
import { Kayo } from "../Kayo";

export class VirtualTextureSystem {
	private _kayo: Kayo;
	private _gpux: GPUX;
	private _wasmx: WASMX;

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

	public constructor(kayo: Kayo) {
		// Construction order is relevant!
		this._kayo = kayo;
		this._gpux = this._kayo.gpux;
		this._wasmx = this._kayo.wasmx;

		if (Math.floor(this._gpux.gpuDevice.limits.maxTextureDimension2D / this.physicalTileSize) > 256)
			this._physicalLayerSize = this.physicalTileSize * 256;
		else this._physicalLayerSize = this._gpux.gpuDevice.limits.maxTextureDimension2D;
		this._tilesPerDimension = Math.floor(this._physicalLayerSize / this.physicalTileSize);
		this._tilesPerLayer = this._tilesPerDimension * this._tilesPerDimension;
		this._tilesInTotal = this._tilesPerLayer * this._physicalLayers;

		this.physicalTexture = new PhysicalTexture(this, this._gpux);
		this.indirectionTableAtlas = new IndirectionTableAtlas(this, this._gpux);
		this.textureSVTData = new TextureSVTData(this, this._gpux);

		const device = this._gpux.gpuDevice;
		this.bindGroupEntries = [
			{ binding: 128, resource: { buffer: this.textureSVTData.gpuBuffer } },
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

	public get kayo() {
		return this._kayo;
	}
	public get gpux() {
		return this._gpux;
	}
	public get wasmx() {
		return this._wasmx;
	}
	public get svtConfig() {
		return this._wasmx.projectData.svtConfig;
	}
	public get logicalTileSize() {
		return this.svtConfig.logicalTileSize;
	}
	public get tileBorder() {
		return this.svtConfig.tileBorder;
	}
	public get physicalTileSize() {
		return this.svtConfig.physicalTileSize;
	}
	public get largestAtlasMipSize() {
		return this.svtConfig.largestAtlasMipSize;
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
	public static get bindGroupLayoutEntries(): GPUBindGroupLayoutEntry[] {
		return [
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

import { GPUX } from "../GPUX";
import TextureUtils from "./TextureUtils";
import { VirtualTexture2D } from "./VirtualTexture2D";
import { VirtualTextureSystem } from "./VirtualTextureSystem";

export class PhysicalTexture {
	/**
	 * The virtual texture system this physical texture belongs to.
	 */
	public virtualTextureSystem: VirtualTextureSystem;
	/**
	 * The logical image size (= width = height) of a tile in texels.
	 */
	public logicalTileSize = 128;
	/**
	 * Border per side in texels.
	 */
	public border = 16;
	/**
	 * The physical image size (= width = height) of a tile in texels.
	 */
	public physicalTileSize = this.logicalTileSize + 2 * this.border; // 2 pixels padding at each side for mip maps and liner filtering.
	/**
	 * The number of layers of the physical texture. This can be chose based on preference.
	 */
	public layers = 4;
	/**
	 * The size (= width = height) of the physical texture in texels. This will be set to approx. maxTextureDimension2D.
	 */
	public size: number;
	/**
	 * The number of tiles a one dimension of the physical texture can store.
	 */
	public tilesPerDimension: number;
	/**
	 * The number of tiles one layer of the physical texture can store.
	 */
	public tilesPerLayer: number;
	/**
	 * The total number of tiles the physical texture can store.
	 */
	public totalTiles: number;
	/**
	 * The gpu texture of this physical texture.
	 */
	public gpuTexture: GPUTexture;
	public constructor(virtualTextureSystem: VirtualTextureSystem, gpux: GPUX) {
		this.virtualTextureSystem = virtualTextureSystem;
		if (Math.floor(gpux.gpuDevice.limits.maxTextureDimension2D / this.physicalTileSize) > 256)
			this.size = this.physicalTileSize * 256;
		else this.size = gpux.gpuDevice.limits.maxTextureDimension2D;
		this.tilesPerDimension = Math.floor(this.size / this.physicalTileSize);
		this.tilesPerLayer = this.tilesPerDimension * this.tilesPerDimension;
		this.totalTiles = this.tilesPerLayer * this.layers;
		const physicalTextureDescriptor: GPUTextureDescriptor = {
			label: "SVT physical texture array",
			dimension: "2d",
			size: [this.size, this.size, this.layers],
			format: "rgba8unorm",
			mipLevelCount: 5,
			sampleCount: 1,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
			viewFormats: ["rgba8unorm"],
		};
		this.gpuTexture = gpux.gpuDevice.createTexture(physicalTextureDescriptor);
	}

	public generateAllMips() {
		TextureUtils.generateMipMap(this.gpuTexture);
	}

	public getAtlasTileCoordinate(vt: VirtualTexture2D) {
		return [vt.virtualTextureID % this.tilesPerDimension, Math.floor(vt.virtualTextureID / this.tilesPerDimension)];
	}
}

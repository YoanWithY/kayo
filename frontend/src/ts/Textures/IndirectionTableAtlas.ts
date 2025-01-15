import { GPUX } from "../GPUX";
import TextureUtils from "./TextureUtils";
import { VirtualTexture2D } from "./VirtualTexture2D";
import { VirtualTextureSystem } from "./VirtualTextureSystem";


export class IndirectionTableAtlas {
	public static readonly components = 4;
	/**
	 * The virtual texturing system this atlas belongs to.
	 */
	virtualTextureSystem: VirtualTextureSystem;
	/**
	 * The size (= width = height) of the indirection table atlas in tiles/texels.
	 */
	size: number;
	/**
	 * The number of tiles/texels each layer can store.
	 */
	tilesPerLayer: number;
	/**
	 * The number of layers of the indirection table atlas.
	 */
	layers: number;
	/**
	 * The total number of tiles/texel that can be populated with data. This is the same as {@link virtualTextureSystem.physicalTexture.totalTiles}.
	 */
	totalUsableTiles: number;
	/**
	 * The data levels of the indirections table atlas mips.
	 */
	dataLayers: Uint8Array[];
	/**
	 * The gpu texture of this indirection table atlas.
	 */
	gpuTexture: GPUTexture;
	constructor(virtualTextureSystem: VirtualTextureSystem, gpux: GPUX) {
		this.virtualTextureSystem = virtualTextureSystem;

		this.totalUsableTiles = this.virtualTextureSystem.physicalTexture.totalTiles;
		this.size = Math.min(Math.ceil(Math.sqrt(this.virtualTextureSystem.physicalTexture.totalTiles)), 256);
		this.tilesPerLayer = this.size * this.size;
		this.layers = Math.ceil(this.virtualTextureSystem.physicalTexture.totalTiles / this.tilesPerLayer);

		this.dataLayers = new Array<Uint8Array>(this.layers);
		for (let layer = 0; layer < this.layers; layer++) {
			this.dataLayers[layer] = new Uint8Array(this.tilesPerLayer * IndirectionTableAtlas.components);
		}

		const indirectionTableTextureDescriptor: GPUTextureDescriptor = {
			label: "SVT indirection table texture",
			dimension: "2d",
			size: [this.size, this.size, this.layers],
			format: "rgba8uint",
			mipLevelCount: TextureUtils.getFullMipPyramidLevels(this.size),
			sampleCount: 1,
			usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
			viewFormats: ["rgba8uint"],
		};
		this.gpuTexture = gpux.gpuDevice.createTexture(indirectionTableTextureDescriptor);
	}

	public allocateIndirectionTable(_virtualTexture: VirtualTexture2D): undefined {
		console.error("Allocate indirection table is not implemented");
		return undefined;
	}
}

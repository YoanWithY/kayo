import { GPUX } from "../GPUX";
import { VirtualTexture2D } from "./VirtualTexture2D";
import { VirtualTextureSystem } from "./VirtualTextureSystem";

interface IndexBlock {
	/**
	 * Inclusiv
	 */
	start: number,
	/**
	 * Inclusiv
	 */
	end: number;
}

/**
 * This class represents the indirection index table and image info table for a virtual texturing system.
 */
export class IndirectionIndexTable {
	/**
	 * The number of components in an image info table entry.
	 */
	public static infoComponents: number = 4;
	/**
	 * The number of components in an indirection index table entry .
	 */
	public static indirectionIndexComponents: number = 2;
	/**
	 * The virtual texture system this indirection index table belongs to.
	 */
	public virtualTextureSystem: VirtualTextureSystem;
	/**
	 * The size (= width = height) of the indirection index table and image info table.
	 */
	public size: number;
	/**
	 * The number of tiles/texels per layer.
	 */
	public tilesPerLayer: number;
	/**
	 * The maximum number of textures that can be addressed by this indirection index table and info table. This is the same as `{@link virtualTextureSystem.indirectionTable.totalUsableTiles}`.
	 */
	public maxTextures: number;
	/**
	 * The number of currently allocated textures.
	 */
	public allocatedTextures: number;
	/**
	 * The gpu texture of the indirection index table.
	 */
	public indirectionIndexTableGPUTexture: GPUTexture;
	/**
	 * The gpu texture of the image info table.
	 */
	public imageInfoGPUTexture: GPUTexture;
	/**
	 * The image info data in row-column memory layout.
	 */
	public infoData: Uint16Array;
	/**
	 * The indirection index table data in row-column-layer memory layout.
	 */
	public indirectionIndexData: Uint8Array;
	/**
	 * Each element is marks the start and end of a block allocated tiles (inclusiv), such that the tile after the end is definitely free.
	 */
	private indexBlocks: IndexBlock[];
	constructor(virtualTextureSystem: VirtualTextureSystem, gpux: GPUX) {
		this.virtualTextureSystem = virtualTextureSystem;
		this.maxTextures = this.virtualTextureSystem.indirectionTableAtlas.totalUsableTiles;
		this.allocatedTextures = 0;
		this.indexBlocks = [{ start: -1, end: -1 }];
		this.size = Math.ceil(Math.sqrt(this.virtualTextureSystem.indirectionTableAtlas.totalUsableTiles));
		this.tilesPerLayer = this.size * this.size;

		this.infoData = new Uint16Array(this.tilesPerLayer * IndirectionIndexTable.infoComponents);
		this.indirectionIndexData = new Uint8Array(this.tilesPerLayer * IndirectionIndexTable.indirectionIndexComponents);

		const indirectionIndexTableTextureDescriptor: GPUTextureDescriptor = {
			label: "SVT indirection index table texture",
			dimension: "2d",
			size: [this.size, this.size, 1],
			format: "rg8uint",
			mipLevelCount: 1,
			sampleCount: 1,
			usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
			viewFormats: ["rg8uint"],
		};
		this.indirectionIndexTableGPUTexture = gpux.gpuDevice.createTexture(indirectionIndexTableTextureDescriptor);

		const virtualTexturesInfoTextureDescriptor: GPUTextureDescriptor = {
			label: "SVT info table texture",
			dimension: "2d",
			size: [this.size, this.size, 1],
			format: "rgba16uint",
			mipLevelCount: 1,
			sampleCount: 1,
			usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
			viewFormats: ["rgba16uint"],
		};
		this.imageInfoGPUTexture = gpux.gpuDevice.createTexture(virtualTexturesInfoTextureDescriptor);
	}

	public allocateVirtualTextureID(): number | undefined {
		if (this.allocatedTextures >= this.maxTextures)
			return undefined;
		const firstBlock = this.indexBlocks[0];
		const nextBlock = this.indexBlocks[1];
		const nextFree = firstBlock.end + 1;
		if (nextBlock === undefined) {
			firstBlock.end++;
		} else {
			if (nextBlock.start - 1 === nextFree) {
				firstBlock.end = nextBlock.end;
				this.indexBlocks.splice(1, 1);
			} else {
				firstBlock.end++;
			}
		}
		return nextFree;
	}

	public freeVirtualTextureID(id: number) {
		for (let i = 0; i < this.indexBlocks.length; i++) {
			const indexBlock = this.indexBlocks[i];
			if (!(id >= indexBlock.start && id <= indexBlock.end))
				continue;

			if (indexBlock.start === indexBlock.end) {
				this.indexBlocks.splice(i, 1);
				return;
			}

			if (id === indexBlock.start) {
				indexBlock.start++;
				return;
			}

			if (id === indexBlock.end) {
				indexBlock.end--;
				return;
			}

			this.indexBlocks.splice(i, 0, { start: id + 1, end: indexBlock.end });
			indexBlock.end = id - 1;
			return;
		}
	}

	public getValuesAtTile(id: number, layer: number): Uint8Array {
		const srcOffset = (id + layer * this.tilesPerLayer) * IndirectionIndexTable.indirectionIndexComponents;
		return this.indirectionIndexData.subarray(srcOffset, srcOffset + IndirectionIndexTable.indirectionIndexComponents);
	}

	public setDataOf(vt: VirtualTexture2D, flushToGPU: boolean = false) {
		const id = vt.virtualTextureID;
		const y = Math.floor(id / this.size);
		const x = id % this.size;
		this.infoData.set([
			vt.width,
			vt.height,
			vt.maxMipLevels << 8 | vt.firstAtlasedLevel,
			0 | // @todo: table atlas layer
			(vt.getFilteringValue() << 4) |
			(vt.getUAddresModeValue() << 2) |
			(vt.getVAddresModeValue())
		], id * IndirectionIndexTable.infoComponents);

		if (flushToGPU) {
			const queue = this.virtualTextureSystem.gpux.gpuDevice.queue;
			queue.writeTexture({ texture: this.imageInfoGPUTexture, origin: [x, y, 0] }, this.infoData.subarray(id * IndirectionIndexTable.infoComponents), {}, [1, 1, 1]);
		}
	}
}

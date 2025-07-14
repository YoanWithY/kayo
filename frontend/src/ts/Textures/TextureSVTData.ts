import { GPUX } from "../GPUX";
import { VirtualTexture2D } from "./VirtualTexture2D";
import { VirtualTextureSystem } from "./VirtualTextureSystem";

interface IndexBlock {
	/**
	 * Inclusiv
	 */
	start: number;
	/**
	 * Inclusiv
	 */
	end: number;
}

/**
 * This class represents the indirection index table and image info table for a virtual texturing system.
 */
export class TextureSVTData {
	public static componentsPerEntry = 4;
	private _virtualTextureSystem: VirtualTextureSystem;
	/**
	 * The number of currently allocated textures.
	 */
	private _allocatedTextures: number;
	/**
	 * The image info data in row-column memory layout.
	 */
	private _svtData: Uint32Array;
	/**
	 * Each element marks the start and end of a block allocated tiles (inclusiv), such that the tile after the end is definitely free.
	 */
	private _indexBlocks: IndexBlock[];
	private _gpuBuffer: GPUBuffer;
	public constructor(virtualTextureSystem: VirtualTextureSystem, gpux: GPUX) {
		this._virtualTextureSystem = virtualTextureSystem;

		this._allocatedTextures = 0;
		this._indexBlocks = [{ start: -1, end: -1 }];

		this._svtData = new Uint32Array(this._virtualTextureSystem.tilesInTotal * 4);

		const bufferDescriptor: GPUBufferDescriptor = {
			label: "SVT data buffer",
			size: this._svtData.byteLength,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
		};
		this._gpuBuffer = gpux.gpuDevice.createBuffer(bufferDescriptor);
	}

	public get gpuBuffer() {
		return this._gpuBuffer;
	}

	public allocateVirtualTextureID(): number | undefined {
		if (this._allocatedTextures >= this._virtualTextureSystem.tilesInTotal) return undefined;
		const firstBlock = this._indexBlocks[0];
		const nextBlock = this._indexBlocks[1];
		const nextFree = firstBlock.end + 1;
		if (nextBlock === undefined) {
			firstBlock.end++;
		} else {
			if (nextBlock.start - 1 === nextFree) {
				firstBlock.end = nextBlock.end;
				this._indexBlocks.splice(1, 1);
			} else {
				firstBlock.end++;
			}
		}
		return nextFree;
	}

	public freeVirtualTextureID(id: number) {
		for (let i = 0; i < this._indexBlocks.length; i++) {
			const indexBlock = this._indexBlocks[i];
			if (!(id >= indexBlock.start && id <= indexBlock.end)) continue;

			if (indexBlock.start === indexBlock.end) {
				this._indexBlocks.splice(i, 1);
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

			this._indexBlocks.splice(i, 0, { start: id + 1, end: indexBlock.end });
			indexBlock.end = id - 1;
			return;
		}
	}

	public setDataOf(vt: VirtualTexture2D, flushToGPU: boolean = false) {
		const id = vt.virtualTextureID;
		const componentOffset = id * TextureSVTData.componentsPerEntry;
		this._svtData.set(
			[
				vt.width,
				vt.height,
				(vt.getFilteringValue() << 20) |
					(vt.getUAddresModeValue() << 18) |
					(vt.getVAddresModeValue() << 16) |
					(vt.maxMipLevels << 8) |
					vt.firstAtlasedLevel,
				(0 << 16) | (0 << 8) | (0 << 8), // @todo: add coordinates
			],
			componentOffset,
		);
		if (flushToGPU) {
			const byteOffset = componentOffset * 4;
			const queue = this._virtualTextureSystem.gpux.gpuDevice.queue;
			queue.writeBuffer(this._gpuBuffer, byteOffset, this._svtData, byteOffset);
		}
	}
}

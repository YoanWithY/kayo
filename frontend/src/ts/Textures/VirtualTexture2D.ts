import { SVTWriteTask } from "../ressourceManagement/SVTFSTask";
import { Texture2D } from "./TextureLoader";
import TextureUtils from "./TextureUtils";
import { VirtualTextureSystem } from "./VirtualTextureSystem";

export interface VirtualTextureSamplingDescriptor {
	addressModeU: GPUAddressMode;
	addressModeV: GPUAddressMode;
	magFilter: GPUFilterMode;
	minFilter: GPUFilterMode;
	mipmapFilter: GPUMipmapFilterMode;
	useAnisotropicFiltering: boolean;
}

export class VirtualTexture2D implements Texture2D {
	public static addressModeValueTable: { [key in GPUAddressMode]: number } = {
		"clamp-to-edge": 0,
		repeat: 1,
		"mirror-repeat": 2,
	};
	public virtualTextureSystem: VirtualTextureSystem;
	public uid: string;
	public width: number;
	public height: number;
	public samplingDescriptor: VirtualTextureSamplingDescriptor;
	public maxMipLevels: number;
	public firstAtlasedLevel: number;
	public virtualTextureID!: number;
	public constructor(
		virtualTextureSystem: VirtualTextureSystem,
		uid: string,
		vid: number,
		width: number,
		height: number,
		addressModeU: GPUAddressMode,
		addressModeV: GPUAddressMode,
		magFilter: GPUFilterMode,
		minFilter: GPUFilterMode,
		mipmapFilter: GPUMipmapFilterMode,
		useAnisotropicFiltering: boolean,
	) {
		this.virtualTextureSystem = virtualTextureSystem;
		this.uid = uid;
		this.virtualTextureID = vid;
		this.width = width;
		this.height = height;
		this.samplingDescriptor = {
			addressModeU,
			addressModeV,
			magFilter,
			minFilter,
			mipmapFilter,
			useAnisotropicFiltering,
		};
		this.maxMipLevels = TextureUtils.getFullMipPyramidLevels(this.width, this.height);
		this.firstAtlasedLevel = Math.max(
			TextureUtils.getFirstAtlasedLevel(this.width, this.virtualTextureSystem.largestAtlasedMipSize),
			TextureUtils.getFirstAtlasedLevel(this.height, this.virtualTextureSystem.largestAtlasedMipSize),
		);
	}

	/**
	 * @todo implementation incompleate
	 * @param image
	 * @param level
	 * @param xTile
	 * @param yTile
	 */
	public makeResident(image: ArrayBufferView, level: number, _tileX: number, _tileY: number) {
		if (level <= this.firstAtlasedLevel) {
			const ph = this.virtualTextureSystem.physicalTexture;
			const coord = ph.getAtlasTileCoordinate(this);
			const tileSize = this.virtualTextureSystem.physicalTileSize;
			this.virtualTextureSystem.gpux.gpuDevice.queue.writeTexture(
				{
					texture: ph.gpuTexture,
					origin: [coord[0] * tileSize, coord[1] * tileSize, 0],
				},
				image,
				{ offset: 0, bytesPerRow: tileSize * 4, rowsPerImage: tileSize },
				[tileSize, tileSize, 1],
			);
		}
	}

	public writeToFileSystem(
		data: Uint8Array<SharedArrayBuffer>,
		level: number,
		tileX: number,
		tileY: number,
		finishedCallback: (returnValue: number) => void,
	) {
		this.virtualTextureSystem.wasmx.taskQueue.queueSVTTask(
			new SVTWriteTask(data, "", level, tileX, tileY, finishedCallback),
		);
	}

	public widthOfLevel(level: number): number {
		return TextureUtils.getResolutionOfMip(this.width, level);
	}

	public heightOfLevel(level: number): number {
		return TextureUtils.getResolutionOfMip(this.height, level);
	}

	public xTilesOfLevel(level: number) {
		return Math.ceil(this.widthOfLevel(level) / this.virtualTextureSystem.logicalTileSize);
	}

	public yTilesOfLevel(level: number) {
		return Math.ceil(this.heightOfLevel(level) / this.virtualTextureSystem.logicalTileSize);
	}

	public getMinFilterValue(): number {
		return this.samplingDescriptor.minFilter === "linear" ? 1 : 0;
	}

	public getMagFilterValue(): number {
		return this.samplingDescriptor.magFilter === "linear" ? 1 : 0;
	}

	public getMipmapFilterValue(): number {
		return this.samplingDescriptor.mipmapFilter === "linear" ? 1 : 0;
	}

	public getFilteringValue(): number {
		if (this.samplingDescriptor.useAnisotropicFiltering) return 8;
		return (this.getMipmapFilterValue() << 2) | (this.getMagFilterValue() << 1) | this.getMinFilterValue();
	}

	public getUAddresModeValue(): number {
		return VirtualTexture2D.addressModeValueTable[this.samplingDescriptor.addressModeU as GPUAddressMode];
	}

	public getVAddresModeValue(): number {
		return VirtualTexture2D.addressModeValueTable[this.samplingDescriptor.addressModeV as GPUAddressMode];
	}

	public isMipAtlasedOnly(): boolean {
		return this.firstAtlasedLevel === 0;
	}
}

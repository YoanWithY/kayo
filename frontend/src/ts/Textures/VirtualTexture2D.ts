import { CPUTexture } from "./CPUTexture";
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
	static addressModeValueTable: { [key in GPUAddressMode]: number } = {
		"clamp-to-edge": 0,
		repeat: 1,
		"mirror-repeat": 2,
	};
	virtualTextureSystem: VirtualTextureSystem;
	uid: string;
	width: number;
	height: number;
	samplingDescriptor: VirtualTextureSamplingDescriptor;
	maxMipLevels: number;
	firstAtlasedLevel: number;
	virtualTextureID!: number;
	constructor(
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
	public makeResident(image: CPUTexture, level: number, _xTile: number, _yTile: number) {
		if (level <= this.firstAtlasedLevel) {
			const ph = this.virtualTextureSystem.physicalTexture;
			const coord = ph.getAtlasTileCoordinate(this);
			this.virtualTextureSystem.gpux.gpuDevice.queue.writeTexture(
				{ texture: ph.gpuTexture, origin: [coord[0] * ph.physicalTileSize, coord[1] * ph.physicalTileSize, 0] },
				image.data[0],
				{ bytesPerRow: ph.physicalTileSize * 4 },
				[ph.physicalTileSize, ph.physicalTileSize, 1],
			);
		}
	}

	public widthOfLevel(level: number): number {
		return TextureUtils.getResolutionOfMip(this.width, level);
	}

	public heightOfLevel(level: number): number {
		return TextureUtils.getResolutionOfMip(this.height, level);
	}

	public xTilesOfLevel(level: number) {
		return Math.ceil(this.widthOfLevel(level) / this.virtualTextureSystem.physicalTexture.logicalTileSize);
	}

	public yTilesOfLevel(level: number) {
		return Math.ceil(this.heightOfLevel(level) / this.virtualTextureSystem.physicalTexture.logicalTileSize);
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

import { GPUX } from "../GPUX";
import TextureUtils from "./TextureUtils";
import { VirtualTexture2D } from "./VirtualTexture2D";
import { VirtualTextureSystem } from "./VirtualTextureSystem";

export class IndirectionTableAtlas {
	public static readonly components = 4;
	private _virtualTextureSystem: VirtualTextureSystem;
	/**
	 * The data levels of the indirections table atlas mips.
	 */
	private _dataLayers: Uint8Array[];

	private _gpuTexture: GPUTexture;
	public constructor(virtualTextureSystem: VirtualTextureSystem, gpux: GPUX) {
		this._virtualTextureSystem = virtualTextureSystem;

		this._dataLayers = new Array<Uint8Array>(this._virtualTextureSystem.layers);
		for (let layer = 0; layer < this._virtualTextureSystem.layers; layer++) {
			this._dataLayers[layer] = new Uint8Array(
				this._virtualTextureSystem.tilesPerLayer * IndirectionTableAtlas.components,
			);
		}

		const indirectionTableTextureDescriptor: GPUTextureDescriptor = {
			label: "SVT indirection table texture",
			dimension: "2d",
			size: [
				this._virtualTextureSystem.tilesPerDimension,
				this._virtualTextureSystem.tilesPerDimension,
				this._virtualTextureSystem.layers,
			],
			format: "rgba8uint",
			mipLevelCount: TextureUtils.getFullMipPyramidLevels(this._virtualTextureSystem.tilesPerDimension),
			sampleCount: 1,
			usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
			viewFormats: ["rgba8uint"],
		};
		this._gpuTexture = gpux.gpuDevice.createTexture(indirectionTableTextureDescriptor);
	}

	public get gpuTexture() {
		return this._gpuTexture;
	}

	public allocateIndirectionTable(_virtualTexture: VirtualTexture2D): undefined {
		console.error("Allocate indirection table is not implemented");
		return undefined;
	}
}

import { GPUX } from "../GPUX";
import TextureUtils from "./TextureUtils";
import { VirtualTexture2D } from "./VirtualTexture2D";
import { VirtualTextureSystem } from "./VirtualTextureSystem";

export class PhysicalTexture {
	private _virtualTextureSystem: VirtualTextureSystem;
	private _gpuTexture: GPUTexture;

	public constructor(virtualTextureSystem: VirtualTextureSystem, gpux: GPUX) {
		this._virtualTextureSystem = virtualTextureSystem;

		const physicalTextureDescriptor: GPUTextureDescriptor = {
			label: "SVT physical texture array",
			dimension: "2d",
			size: [
				this._virtualTextureSystem.physicalLayerSize,
				this._virtualTextureSystem.physicalLayerSize,
				this._virtualTextureSystem.layers,
			],
			format: "rgba8unorm",
			mipLevelCount: 5,
			sampleCount: 1,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
			viewFormats: ["rgba8unorm"],
		};
		this._gpuTexture = gpux.gpuDevice.createTexture(physicalTextureDescriptor);
	}

	public get gpuTexture() {
		return this._gpuTexture;
	}

	public generateAllMips() {
		TextureUtils.generateMipMap(this._gpuTexture);
	}

	public getAtlasTileCoordinate(vt: VirtualTexture2D) {
		return [
			vt.virtualTextureID % this._virtualTextureSystem.tilesPerDimension,
			Math.floor(vt.virtualTextureID / this._virtualTextureSystem.tilesPerDimension),
		];
	}
}

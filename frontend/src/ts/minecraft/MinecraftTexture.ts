import TextureUtils from "../Textures/TextureUtils";
import { VirtualTexture2D } from "../Textures/VirtualTexture2D";

export class MinecraftTexture {
	name: string;
	image: ImageBitmap;
	hasTransparent = false;
	hasSemiTransparent = false;
	virtualTexture: VirtualTexture2D;
	constructor(name: string, image: ImageBitmap, fallback: VirtualTexture2D) {
		this.name = name;
		this.image = image;

		this.scan(image);

		const vt = fallback.virtualTextureSystem.allocateVirtualTexture(
			name,
			image.width,
			image.height,
			"clamp-to-edge",
			"clamp-to-edge",
			"linear",
			"nearest",
			"linear",
			true,
		);
		if (vt === undefined) {
			this.virtualTexture = fallback;
			return;
		}
		this.virtualTexture = vt;
		const atlas = fallback.virtualTextureSystem.generateMipAtlas(image, this.virtualTexture.samplingDescriptor);
		this.virtualTexture.makeResident(atlas, 0, 0, 0);
	}

	private scan(image: ImageBitmap) {
		const data = TextureUtils.getImagePixels(image);
		for (let i = 3; i < data.length; i += 4) {
			if (this.hasSemiTransparent && this.hasSemiTransparent) return;

			const alpha = data[i];
			if (alpha === 0) {
				this.hasTransparent = true;
				continue;
			}

			if (alpha < 200) {
				this.hasSemiTransparent = true;
				continue;
			}
		}
	}
	isOpaque(): boolean {
		return !this.hasSemiTransparent && !this.hasTransparent;
	}
}

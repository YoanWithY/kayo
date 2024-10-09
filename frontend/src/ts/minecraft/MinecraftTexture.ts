import { imageToTexture } from "../rendering/Shader";

const canvas = new OffscreenCanvas(1, 1);
const context = canvas.getContext('2d', { willReadFrequently: true })!;
context.globalCompositeOperation = "copy"
function getImagePixels(imageBitmap: ImageBitmap): Uint8ClampedArray {
	canvas.width = imageBitmap.width;
	canvas.height = imageBitmap.height;
	context.drawImage(imageBitmap, 0, 0);
	const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	return imageData.data;
}

export class MinecraftTexture {
	name: string;
	image: ImageBitmap;
	hasTransparent = false;
	hasSemiTransparent = false;
	gpuTexture: GPUTexture;
	layer!: number;
	constructor(name: string, image: ImageBitmap) {
		this.name = name;
		this.image = image;

		this.gpuTexture = imageToTexture(image, true);

		const data = getImagePixels(image);
		for (let i = 3; i < data.length; i += 4) {
			if (this.hasSemiTransparent && this.hasSemiTransparent)
				return;

			const alpha = data[i];
			if (alpha === 0) {
				this.hasTransparent = true;
				continue;
			}

			if (alpha < 255) {
				this.hasSemiTransparent = true;
				continue;
			}
		}
	}
	isOpaque(): boolean {
		return !this.hasSemiTransparent && !this.hasTransparent;
	}
}
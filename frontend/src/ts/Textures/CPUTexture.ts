import TextureUtils from "./TextureUtils";
import { VirtualTextureSamplingDescriptor } from "./VirtualTexture2D";

function mod(a: number, b: number): number {
	return ((a % b) + b) % b;
}
type AddressMode = (x: number, d: number) => number;
const addressFunctions: { [key in GPUAddressMode]: AddressMode } = {
	"clamp-to-edge": (x: number, d: number) => {
		return Math.max(Math.min(x, d - 1), 0);
	},
	repeat: (x: number, d: number) => {
		return mod(x, d);
	},
	"mirror-repeat": (x: number, d: number) => {
		return d === 0 ? 0 : d - Math.abs(mod(x + 0.5, 2 * d) - d) - 0.5;
	},
};
export class CPUTexture {
	public data: Uint8ClampedArray[];
	public widthAt: number[];
	public heightAt: number[];
	/**
	 *
	 * @param width The width of the image in texels at mip 0
	 * @param height The height of the image in texels at mip 0
	 * @param levels The number of mipmap levels to use, 0 for all.
	 * @param data The data of the image at mip 0.
	 */
	public constructor(width: number, height: number, levels = 1, data?: Uint8ClampedArray) {
		const mips = levels === 0 ? TextureUtils.getFullMipPyramidLevels(width, height) : levels;
		this.widthAt = new Array(mips);
		this.heightAt = new Array(mips);
		for (let i = 0; i < mips; i++) {
			this.widthAt[i] = TextureUtils.getResolutionOfMip(width, i);
			this.heightAt[i] = TextureUtils.getResolutionOfMip(height, i);
		}
		this.data = new Array(mips);
		if (data === undefined) data = new Uint8ClampedArray(this.widthAt[0] * this.heightAt[0] * 4);
		this.data[0] = data;
		for (let i = 1; i < this.data.length; i++) this.generateMip(i);
	}

	private generateMip(level: number) {
		const prevLevel = level - 1;
		const newWidth = this.widthAt[level];
		const newHeight = this.heightAt[level];
		this.data[level] = new Uint8ClampedArray(newWidth * newHeight * 4);
		const p: [number, number, number, number] = [0, 0, 0, 0];
		for (let y = 0; y < newHeight; y++) {
			const y2 = y * 2;
			for (let x = 0; x < newWidth; x++) {
				const x2 = x * 2;
				const ps = [
					this.readDirect(x2, y2, prevLevel),
					this.readDirect(x2 + 1, y2, prevLevel),
					this.readDirect(x2 + 1, y2 + 1, prevLevel),
					this.readDirect(x2, y2 + 1, prevLevel),
				];
				for (let c = 0; c < 4; c++) p[c] = (ps[0][c] + ps[1][c] + ps[2][c] + ps[3][c]) / 4;
				this.write(x, y, level, p);
			}
		}
	}

	public readDirect(x: number, y: number, level: number): [number, number, number, number] {
		const d = this.data[level];
		const o = (y * this.widthAt[level] + x) * 4;
		return [d[o], d[o + 1], d[o + 2], d[o + 3]];
	}

	public read(
		x: number,
		y: number,
		level: number,
		au: AddressMode = addressFunctions["clamp-to-edge"],
		av: AddressMode = addressFunctions["clamp-to-edge"],
	): [number, number, number, number] {
		x = au(x, this.widthAt[level]);
		y = av(y, this.heightAt[level]);
		return this.readDirect(x, y, level);
	}

	public write(x: number, y: number, level: number, value: [number, number, number, number]) {
		this.data[level].set(value, (y * this.widthAt[level] + x) * 4);
	}

	public copyFrom(
		t: CPUTexture,
		level: number,
		offsetX: number,
		offsetY: number,
		dstLevel: number,
		border: number,
		sampling: VirtualTextureSamplingDescriptor,
	) {
		const au = addressFunctions[sampling.addressModeU];
		const av = addressFunctions[sampling.addressModeV];
		for (let y = -border; y < t.heightAt[level] + border; y++) {
			for (let x = -border; x < t.widthAt[level] + border; x++) {
				this.write(offsetX + x, offsetY + y, dstLevel, t.read(x, y, level, au, av));
			}
		}
	}
}

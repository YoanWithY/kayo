import { ResourcePack as ResourcePack } from "./ResourcePack";
import { MinecraftSection } from "./MinecraftSection";
import { BlockNeighborhood } from "./MinecraftBlock";
import { MinecraftMetaRenderingPipeline } from "./MinecraftOpaquePipeline";

export type PaletteEntry = { Name: string; Properties?: { [key: string]: string } };

export class MinecraftWorld {
	name: string;
	ressourcePack: ResourcePack;
	bundle!: GPURenderBundle;
	renderSize: number;

	private _sections: { [key: string]: MinecraftSection };

	constructor(name: string, ressourcePack: ResourcePack, renderSize: number) {
		this.name = name;
		this.ressourcePack = ressourcePack;
		this._sections = {};
		this.renderSize = renderSize;
	}

	buildGeometry() {
		for (const key in this._sections) {
			this._sections[key].buildGeometry();
		}
	}

	buildBundle(gpuDevice: GPUDevice, bindGroup0: GPUBindGroup) {
		const e = gpuDevice.createRenderBundleEncoder({
			label: "Minecraft render bundle encoder",
			colorFormats: ["bgra8unorm", "r16uint"],
			depthStencilFormat: "depth24plus",
			sampleCount: 4,
		});
		e.setBindGroup(0, bindGroup0);
		e.setPipeline(
			MinecraftMetaRenderingPipeline.metaPipeline.getRenderPipeline({
				msaa: 1,
				outputColorSpace: "srgb",
				swapChainBitDepth: 8,
				outputComponentTransfere: "sRGB",
				useColorQuantisation: false,
				useDithering: false,
			}).gpuPipeline,
		);
		// e.setBindGroup(2, MinecraftOpaquePipeline.bindGroup2)
		this.render(e);
		this.bundle = e.finish({ label: "Minecraft World bundle" });
	}

	render(renderPassEncoder: GPURenderPassEncoder | GPURenderBundleEncoder) {
		let quads = 0;
		let chunks = 0;
		for (const key in this._sections) {
			chunks++;
			quads += this._sections[key].render(renderPassEncoder);
		}
		console.log(quads, chunks);
	}

	renderBundle(renderPassEncoder: GPURenderPassEncoder) {
		renderPassEncoder.executeBundles([this.bundle]);
	}

	getSection(x: number, y: number, z: number): MinecraftSection | undefined {
		return this._sections[`${x},${y},${z}`];
	}

	setSection(x: number, y: number, z: number, section: MinecraftSection) {
		return (this._sections[`${x},${y},${z}`] = section);
	}

	getNeighborhoodOf(_x: number, _y: number, _z: number, x: number, y: number, z: number): BlockNeighborhood {
		const ret: BlockNeighborhood = {};
		const section = this.getSection(_x, _y, _z);
		if (!section) return ret;

		if (x === 15) ret.east = this.getSection(_x + 1, _y, _z)?.getBlock(0, y, z);
		else ret.east = section.getBlock(x + 1, y, z);

		if (y === 15) ret.up = this.getSection(_x, _y + 1, _z)?.getBlock(x, 0, z);
		else ret.up = section.getBlock(x, y + 1, z);

		if (z === 15) ret.south = this.getSection(_x, _y, _z + 1)?.getBlock(x, y, 0);
		else ret.south = section.getBlock(x, y, z + 1);

		if (x === 0) ret.west = this.getSection(_x - 1, _y, _z)?.getBlock(15, y, z);
		else ret.west = section.getBlock(x - 1, y, z);

		if (y === 0) ret.down = this.getSection(_x, _y - 1, _z)?.getBlock(x, 15, z);
		else ret.down = section.getBlock(x, y - 1, z);

		if (z === 0) ret.north = this.getSection(_x, _y, _z - 1)?.getBlock(x, y, 15);
		else ret.north = section.getBlock(x, y, z - 1);

		return ret;
	}
}

import { ResourcePack as ResourcePack } from "./ResourcePack";
import { MinecraftSection } from "./MinecraftSection";
import { BlockNeighborhood } from "./MinecraftBlock";
import { MinecraftMetaRenderingPipeline } from "./MinecraftOpaquePipeline";
import {
	AbstractMetaRenderPipeline,
	RenderBundleCache,
	RenderConfigKey,
} from "../rendering/AbstractMetaRenderingPipeline";
import { Project } from "../project/Project";
import RealtimeRenderer from "../rendering/RealtimeRenderer";

export type PaletteEntry = { Name: string; Properties?: { [key: string]: string } };

export class MinecraftWorld {
	public name: string;
	public ressourcePack: ResourcePack;
	public bundle!: GPURenderBundle;
	public renderSize: number;
	protected _renderBundleCache: RenderBundleCache;
	protected _project: Project;

	private _sections: { [key: string]: MinecraftSection };

	public constructor(project: Project, name: string, ressourcePack: ResourcePack, renderSize: number) {
		this._project = project;
		this.name = name;
		this.ressourcePack = ressourcePack;
		this._sections = {};
		this.renderSize = renderSize;
		this._renderBundleCache = new RenderBundleCache();
		this._renderBundleCache.buildFunction = this._buildBundle;
	}

	public buildGeometry() {
		for (const key in this._sections) {
			this._sections[key].buildGeometry();
		}
	}

	private _buildBundle = (renderConfigKey: RenderConfigKey) => {
		const renderBundleEncoder = this._project.gpux.gpuDevice.createRenderBundleEncoder({
			label: "minecraft realtime",
			colorFormats: AbstractMetaRenderPipeline.getColorFormats(renderConfigKey, this._project.gpux),
			depthStencilFormat: "depth24plus",
			sampleCount: renderConfigKey.msaa,
		});
		renderBundleEncoder.setBindGroup(0, this._project.renderers[RealtimeRenderer.rendererKey].bindGroup0);
		const pipeline = MinecraftMetaRenderingPipeline.metaPipeline.getRenderPipeline(renderConfigKey);

		renderBundleEncoder.setPipeline(pipeline.gpuPipeline);
		this.recordRender(renderBundleEncoder);
		return renderBundleEncoder.finish({ label: "Minecraft World bundle" });
	};

	public recordRender(renderPassEncoder: GPURenderPassEncoder | GPURenderBundleEncoder) {
		let quads = 0;
		let chunks = 0;
		for (const key in this._sections) {
			chunks++;
			quads += this._sections[key].render(renderPassEncoder);
		}
		console.log(quads, chunks);
	}

	public renderBundle(renderPassEncoder: GPURenderPassEncoder, renderConfigKey: RenderConfigKey) {
		renderPassEncoder.executeBundles([this._renderBundleCache.getBundle(renderConfigKey)]);
	}

	public getSection(x: number, y: number, z: number): MinecraftSection | undefined {
		return this._sections[`${x},${y},${z}`];
	}

	public setSection(x: number, y: number, z: number, section: MinecraftSection) {
		return (this._sections[`${x},${y},${z}`] = section);
	}

	public getNeighborhoodOf(_x: number, _y: number, _z: number, x: number, y: number, z: number): BlockNeighborhood {
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

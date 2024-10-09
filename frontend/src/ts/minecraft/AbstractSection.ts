import { ParsedBlockStateModel } from "./MinecraftBlock";
import { MinecraftWorld, PaletteEntry } from "./MinecraftWorld";

export interface Section {
	minecraftWorld: MinecraftWorld;
	dimension: number;
	x: number;
	y: number;
	z: number;
	getBlockStateModel(): ParsedBlockStateModel | undefined;
}

export class SingleBlockStateSection implements Section {
	minecraftWorld: MinecraftWorld;
	dimension: number;
	x: number;
	y: number;
	z: number;
	paletteEntry: PaletteEntry;
	private blockStateModel: ParsedBlockStateModel | undefined = undefined;

	constructor(minecraftWorld: MinecraftWorld, dimension: number, x: number, y: number, z: number, paletteEntry: PaletteEntry) {
		this.minecraftWorld = minecraftWorld;
		this.dimension = dimension;
		this.x = x;
		this.y = y;
		this.z = z;
		this.paletteEntry = paletteEntry;
		const blockState = this.minecraftWorld.ressourcePack.getBlockStateByURL(this.paletteEntry.Name);
		if (blockState) {
			const blockStateModels = blockState.getBlockStateModelByProperties(paletteEntry.Properties);
			if (blockStateModels)
				if (Array.isArray(blockStateModels))
					this.blockStateModel = blockStateModels[0];
				else
					this.blockStateModel = blockStateModels;
		}
	}

	public getBlockStateModel(): ParsedBlockStateModel | undefined {
		return this.blockStateModel;
	}
}
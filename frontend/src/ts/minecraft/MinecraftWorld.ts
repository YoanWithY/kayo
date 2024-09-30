import { ResourcePack as ResourcePack } from "./ResourcePack";
import { Section } from "./Section";

export type PaletteEntry = { Name: string, Properties?: { Name: string } };

export class MinecraftWorld {
	name: string;
	ressourcePack: ResourcePack;

	sections: { [key: string]: Section };

	constructor(name: string, ressourcePack: ResourcePack) {
		this.name = name;
		this.ressourcePack = ressourcePack;
		this.sections = {};
	}
}
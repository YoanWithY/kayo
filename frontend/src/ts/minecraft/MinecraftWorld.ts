import { ResourcePack as ResourcePack } from "./ResourcePack";
import { MultiBlockStateSection } from "./MultiBlockStateSection";

export type PaletteEntry = { Name: string, Properties?: { [key: string]: string } };

export class MinecraftWorld {
	name: string;
	ressourcePack: ResourcePack;

	sections: { [key: string]: MultiBlockStateSection };

	constructor(name: string, ressourcePack: ResourcePack) {
		this.name = name;
		this.ressourcePack = ressourcePack;
		this.sections = {};
	}

	render(renderPassEncoder: GPURenderPassEncoder) {
		for (const key in this.sections) {
			this.sections[key].render(renderPassEncoder);
		}
	}
}
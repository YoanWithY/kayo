import { Grid } from "../debug/Grid";
import HeightFieldR3 from "../dynamicObject/heightField/HeightFieldR3";
import { Backgrund } from "../lights/Background";
import { SunLight } from "../lights/SunLight";
import { MinecraftWorld } from "../minecraft/MinecraftWorld";
import { Representable, Representation, RepresentationConcept } from "./Representation";

export abstract class SceneRepresentation<
	T extends RepresentationConcept,
	K extends Representable,
> extends Representation<T, K> {
	public abstract addGrid(grid: Grid): void;
	public abstract addMinecraftWorld(minecraftWorld: MinecraftWorld): void;
}

export default class Scene extends Representable {
	public heightFieldObjects = new Set<HeightFieldR3>();
	public sunlights = new Set<SunLight>();
	protected _grids: Grid[];
	protected _minecraftWorlds: MinecraftWorld[];
	protected _background: Backgrund;

	public constructor() {
		super();
		this._grids = [];
		this._minecraftWorlds = [];
		this._background = new Backgrund();
	}

	public addGrid(grid: Grid) {
		this._grids.push(grid);
		for (const representation of this._representations.values() as MapIterator<SceneRepresentation<any, any>>) {
			representation.addGrid(grid);
		}
	}

	public addMinecraftWorld(minecraftWorld: MinecraftWorld) {
		this._minecraftWorlds.push(minecraftWorld);
		for (const representation of this._representations.values() as MapIterator<SceneRepresentation<any, any>>) {
			representation.addMinecraftWorld(minecraftWorld);
		}
	}

	public get background() {
		return this._background;
	}

	public get grids() {
		return this._grids;
	}

	public get minecraftWorlds() {
		return this._minecraftWorlds;
	}
}

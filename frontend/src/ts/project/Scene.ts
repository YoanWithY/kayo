import { Grid } from "../debug/Grid";
import HeightFieldR3 from "../dynamicObject/heightField/HeightFieldR3";
import { Backgrund } from "../lights/Background";
import { Material } from "../mesh/Material";
import { MeshObject } from "../mesh/MeshObject";
import { MinecraftWorld } from "../minecraft/MinecraftWorld";
import { Representable, Representation, RepresentationConcept } from "./Representation";

export abstract class SceneRepresentation<
	T extends RepresentationConcept,
	K extends Representable,
> extends Representation<T, K> {
	public abstract addGrid(grid: Grid): void;
	public abstract addMinecraftWorld(minecraftWorld: MinecraftWorld): void;
	public abstract addMeshObject(meshOject: MeshObject): void;
	public abstract addMaterial(material: Material): void;
}

export default class Scene extends Representable {
	public heightFieldObjects = new Set<HeightFieldR3>();
	protected _grids: Grid[];
	protected _minecraftWorlds: MinecraftWorld[];
	protected _background: Backgrund;
	protected _meshObjects = new Set<MeshObject>();
	protected _materials: Material[] = [];

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

	public addMeshObject(meshObject: MeshObject) {
		this._meshObjects.add(meshObject);
		for (const representation of this._representations.values() as MapIterator<SceneRepresentation<any, any>>) {
			representation.addMeshObject(meshObject);
		}
	}

	public addMaterial(material: Material) {
		this._materials.push(material);
		for (const representation of this._representations.values() as MapIterator<SceneRepresentation<any, any>>) {
			representation.addMaterial(material);
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

	public get meshObjects() {
		return this._meshObjects.values();
	}

	public get materials() {
		return this._materials;
	}
}

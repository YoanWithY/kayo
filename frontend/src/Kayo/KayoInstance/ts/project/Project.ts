import { KayoInstance } from "../KayoInstance";
import { Renderer } from "../Renderer";
import { VirtualTextureSystem } from "../Textures/VirtualTextureSystem";
import { Material } from "../mesh/Material";
import { Scene } from "./Scene";

export class Project {
	private _kayo: KayoInstance;
	private _currentID: number;
	private _projectUUID: string;
	private _displayName: string;
	private _renderers3D: Map<string, Renderer>;
	private _scenes: Map<string, Scene>;
	private _virtualTextureSystem: VirtualTextureSystem;
	protected _materials: Material[] = [];
	public currentScene!: Scene;

	public constructor(kayo: KayoInstance, projectUUID: string) {
		this._kayo = kayo;
		this._currentID = 0;
		this._projectUUID = projectUUID;
		this._displayName = "Unnamed Project";
		this._renderers3D = new Map();
		this._scenes = new Map();
		this._virtualTextureSystem = new VirtualTextureSystem(kayo);
	}

	public get projectUUID() {
		return this._projectUUID;
	}
	public get displayName() {
		return this._displayName;
	}
	public get renderers() {
		return this._renderers3D;
	}
	public get scenes() {
		return this._scenes;
	}
	public get virtualTextureSystem() {
		return this._virtualTextureSystem;
	}
	public get materials() {
		return this._materials;
	}

	public allocID() {
		return this._currentID++;
	}

	public get currentTime() {
		return this._kayo.wasmx.KN.fromDouble(0);
	}
}

import { Background } from "../lights/Background";
import { Representable } from "./Representation";
import { SceneObject } from "./SceneObject";
import { SceneRepresentation } from "./SceneRepresentation";

export class Scene extends Representable {
	protected _rendererableObjects: Map<string, Set<SceneObject>>;
	protected _background?: Background;
	protected _sceneKey: string;

	public constructor(sceneKey: string) {
		super();
		this._rendererableObjects = new Map();
		this._sceneKey = sceneKey;
	}

	public add(sceneObject: SceneObject) {
		let set = this._rendererableObjects.get(sceneObject.type);
		if (!set) {
			set = new Set();
			this._rendererableObjects.set(sceneObject.type, set);
		}
		set.add(sceneObject);

		for (const representation of this._representations.values() as MapIterator<SceneRepresentation<any, any>>)
			representation.add(sceneObject);
	}

	public setBackground(background: Background | undefined) {
		this._background = background;
		for (const representation of this._representations.values() as MapIterator<SceneRepresentation<any, any>>)
			representation.setBackground(background);
	}

	public get background() {
		return this._background;
	}

	public get sceneKey() {
		return this._sceneKey;
	}
}

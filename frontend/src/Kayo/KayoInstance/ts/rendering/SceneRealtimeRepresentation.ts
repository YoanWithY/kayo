import { Scene } from "../project/Scene";
import { SceneRepresentation } from "../project/SceneRepresentation";
import { Background, BackgroundRealtimeRenderingRepresentation } from "../lights/Background";
import { KayoInstance } from "../KayoInstance";
import { MaterialRealtimeRenderingRepresentation } from "../mesh/MaterialRealtimeRenderingRepresentation";
import { RealtimeRenderer } from "./RealtimeRenderer";
import { RealtimeConfigObject } from "./config/RealtimeRenderConfig";
import { KayoNumber } from "../../c/KayoCorePP";
import { RealtimeRenderableRepresentation } from "./RealtimeRenderableRepresentation";
import { SceneObject } from "../project/SceneObject";
import { GridRealtimeRepresentation } from "../debug/Grid";

export class SceneRealtimeRepresentation extends SceneRepresentation<RealtimeRenderer, Scene> {
	protected _kayo: KayoInstance;
	protected _background?: BackgroundRealtimeRenderingRepresentation;
	protected _realtimeRepresentations: Map<string, Set<RealtimeRenderableRepresentation>>
	protected _realtimeRepConstructors: Map<string, {
		new(
			kayo: KayoInstance,
			representationConcept: RealtimeRenderer,
			sceneObject: SceneObject,
			currentConfig: RealtimeConfigObject): RealtimeRenderableRepresentation
	}>
	protected _materials: MaterialRealtimeRenderingRepresentation[];

	public constructor(kayo: KayoInstance, representationConcept: RealtimeRenderer, representationSubject: Scene, currentTime: KayoNumber) {
		super(representationConcept, representationSubject);
		this._kayo = kayo;

		if (representationSubject.background)
			this._background = new BackgroundRealtimeRenderingRepresentation(
				this._kayo,
				representationConcept,
				representationSubject.background,
				representationConcept.createConfigObject(currentTime),
			);

		this._realtimeRepresentations = new Map();

		this._realtimeRepConstructors = new Map();
		this._realtimeRepConstructors.set("Grid", GridRealtimeRepresentation as any);

		this._materials = [];
	}

	public updateConfig(config: RealtimeConfigObject): void {
		if (this._background)
			this._background.update(config);
		for (const set of this._realtimeRepresentations.values())
			for (const rep of set)
				rep.update(config);
		for (const material of this._materials) material.update();
	}

	public add(sceneObject: SceneObject): void {
		const Con = this._realtimeRepConstructors.get(sceneObject.type)
		if (!Con) {
			console.error(`No constructor known for "${sceneObject.type}"`);
			return;
		}

		const realtimeRep = new Con(this._kayo, this._representationConcept, sceneObject, this._representationConcept.createConfigObject(this._kayo.project.currentTime));
		sceneObject.setRepresentation(realtimeRep);

		let set = this._realtimeRepresentations.get(sceneObject.type);
		if (!set) {
			set = new Set();
			this._realtimeRepresentations.set(sceneObject.type, set);
		}
		set.add(realtimeRep);
	}

	public setBackground(background: Background | undefined): void {
		if (!background) {
			this._background = undefined;
			return;
		}

		this._background = new BackgroundRealtimeRenderingRepresentation(this._kayo, this._representationConcept, background, this._representationConcept.createConfigObject(this._kayo.project.currentTime));
	}

	public get background() {
		return this._background;
	}

	public get realtimeRepresentations() {
		return this._realtimeRepresentations;
	}

}

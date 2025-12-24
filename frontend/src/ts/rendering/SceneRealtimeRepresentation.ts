import RealtimeRenderer from "./RealtimeRenderer";
import Scene, { SceneRepresentation } from "../project/Scene";
import { BackgroundRealtimeRenderingRepresentation } from "../lights/Background";
import { Kayo } from "../Kayo";
import { Grid, GridRelatimeRepresentation } from "../debug/Grid";
import { MinecraftWorld } from "../minecraft/MinecraftWorld";
import { MinecraftWorldRealtimeRenderingRepresentation as MinecraftWorldRealtimeRepresentation } from "../minecraft/MinecraftOpaquePipeline";
import { RenderConfig } from "./config/RenderConfig";
import { MeshObject } from "../mesh/MeshObject";
import { MeshObjectRealtimeRenderingRepresentation } from "../mesh/MeshObjectRealtimeRenderingRepresentation";

export class SceneRealtimeRepresentation extends SceneRepresentation<RealtimeRenderer, Scene> {
	protected _kayo: Kayo;
	protected _background: BackgroundRealtimeRenderingRepresentation;
	protected _grids: GridRelatimeRepresentation[];
	protected _minecraftWorlds: MinecraftWorldRealtimeRepresentation[];
	protected _meshObjects: MeshObjectRealtimeRenderingRepresentation[];

	public constructor(kayo: Kayo, representationConcept: RealtimeRenderer, representationSubject: Scene) {
		super(representationConcept, representationSubject);
		this._kayo = kayo;
		this._background = new BackgroundRealtimeRenderingRepresentation(
			this._kayo,
			representationConcept,
			representationSubject.background,
			representationConcept.config,
		);
		this._grids = [];
		this._minecraftWorlds = [];
		this._meshObjects = [];
	}

	public updateConfig(config: RenderConfig): void {
		this._background.update(config);
		for (const grid of this._grids) grid.update(config);
		for (const world of this._minecraftWorlds) world.update(config);
	}

	public addGrid(grid: Grid): void {
		const realtimeGrid = new GridRelatimeRepresentation(
			this._kayo,
			this._representationConcept,
			grid,
			this.representationConcept.config,
		);
		grid.setRepresentation(realtimeGrid);
		this._grids.push(realtimeGrid);
	}

	public addMinecraftWorld(minecraftWorld: MinecraftWorld): void {
		const minecraftWorldRealtimeRepresentation = new MinecraftWorldRealtimeRepresentation(
			this._kayo,
			this._representationConcept,
			minecraftWorld,
			this.representationConcept.config,
		);
		minecraftWorld.setRepresentation(minecraftWorldRealtimeRepresentation);
		this._minecraftWorlds.push(minecraftWorldRealtimeRepresentation);
	}

	public addMeshObject(meshOject: MeshObject): void {
		const meshObjectRealtimeRepresentation = new MeshObjectRealtimeRenderingRepresentation(
			this._kayo.gpux,
			this._representationConcept,
			meshOject,
		);
		meshOject.setRepresentation(meshObjectRealtimeRepresentation);
		this._meshObjects.push(meshObjectRealtimeRepresentation);
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

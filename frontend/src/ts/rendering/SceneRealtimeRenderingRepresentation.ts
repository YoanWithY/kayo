import RealtimeRenderer from "./RealtimeRenderer";
import Scene, { SceneRepresentation } from "../project/Scene";
import { RenderConfig } from "../../c/KayoCorePP";
import { BackgroundRealtimeRepresentation } from "../lights/Background";
import { Kayo } from "../Kayo";
import { Grid, GridRelatimeRepresentation } from "../debug/Grid";
import { MinecraftWorld } from "../minecraft/MinecraftWorld";
import { MinecraftRealtimeRepresentation as MinecraftWorldRealtimeRepresentation } from "../minecraft/MinecraftOpaquePipeline";

export class SceneRealtimeRepresentation extends SceneRepresentation<RealtimeRenderer, Scene> {
	protected _kayo: Kayo;
	protected _background: BackgroundRealtimeRepresentation;
	protected _grids: GridRelatimeRepresentation[];
	protected _minecraftWorlds: MinecraftWorldRealtimeRepresentation[];

	public constructor(
		kayo: Kayo,
		representationConcept: RealtimeRenderer,
		representationSubject: Scene,
		userData: RenderConfig,
	) {
		super(representationConcept, representationSubject);
		this._kayo = kayo;
		this._background = new BackgroundRealtimeRepresentation(
			this._kayo,
			representationConcept,
			representationSubject.background,
			userData,
		);
		this._grids = [];
		this._minecraftWorlds = [];
	}

	public update(config: RenderConfig): void {
		this._background.update(config);
		for (const grid of this._grids) grid.update(config);
		for (const world of this._minecraftWorlds) world.update(config);
	}

	public addGrid(grid: Grid): void {
		const config = this._kayo.wasmx.kayoInstance.project.renderStates.get(RealtimeRenderer.rendererKey)
			?.config as RenderConfig;
		const realtimeGrid = new GridRelatimeRepresentation(this._kayo, this._representationConcept, grid, config);
		grid.setRepresentation(realtimeGrid);
		this._grids.push(realtimeGrid);
	}

	public addMinecraftWorld(minecraftWorld: MinecraftWorld): void {
		const config = this._kayo.wasmx.kayoInstance.project.renderStates.get(RealtimeRenderer.rendererKey)
			?.config as RenderConfig;
		const minecraftWorldRealtimeRepresentation = new MinecraftWorldRealtimeRepresentation(
			this._kayo,
			this._representationConcept,
			minecraftWorld,
			config,
		);
		minecraftWorld.setRepresentation(minecraftWorldRealtimeRepresentation);
		this._minecraftWorlds.push(minecraftWorldRealtimeRepresentation);
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

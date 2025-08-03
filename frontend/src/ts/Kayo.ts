import { FileRessourceManager } from "./ressourceManagement/FileRessourceManager";
import { GPUX } from "./GPUX";
import { Project } from "./project/Project";
import WASMX from "./WASMX";
import { VirtualTextureSystem } from "./Textures/VirtualTextureSystem";
import RealtimeRenderer from "./rendering/RealtimeRenderer";
import { SceneRealtimeRepresentation } from "./rendering/SceneRealtimeRenderingRepresentation";
import { RenderConfig } from "../c/KayoCorePP";
import { Grid } from "./debug/Grid";

export class Kayo {
	private _gpux: GPUX;
	private _wasmx: WASMX;
	private _fileRessourceManager: FileRessourceManager;
	private _audioContext: AudioContext;
	private _virtualTextureSystem: VirtualTextureSystem;
	private _renderers: { [key: string]: RealtimeRenderer } = {};
	private _windows: Set<Window>;
	private _project: Project;

	public constructor(gpux: GPUX, wasmx: WASMX, fileRessourceManager: FileRessourceManager) {
		this._wasmx = wasmx;
		this._gpux = gpux;
		this._fileRessourceManager = fileRessourceManager;
		this._audioContext = new AudioContext({ latencyHint: "interactive" });
		this._virtualTextureSystem = new VirtualTextureSystem(this.gpux, this.wasmx);
		const realtimeRenderer = new RealtimeRenderer(this);
		this._renderers["realtime"] = realtimeRenderer;
		this._windows = new Set();
		this._project = new Project(this);

		const config = this._wasmx.kayoInstance.project.renderStates.get(RealtimeRenderer.rendererKey)
			?.config as RenderConfig;
		this._project.scene.setRepresentation(
			new SceneRealtimeRepresentation(this, realtimeRenderer, this._project.scene, config),
		);
		this._project.scene.addGrid(new Grid());
	}

	public get gpux(): GPUX {
		return this._gpux;
	}

	public get wasmx(): WASMX {
		return this._wasmx;
	}

	public get fileRessourceManager(): FileRessourceManager {
		return this._fileRessourceManager;
	}

	public get audioContext(): AudioContext {
		return this._audioContext;
	}

	public get virtualTextureSystem(): VirtualTextureSystem {
		return this._virtualTextureSystem;
	}

	public get renderers() {
		return this._renderers;
	}

	public get project(): Project {
		return this._project;
	}

	public get windows(): Set<Window> {
		return this._windows;
	}

	public openNewWindow(): void {
		open("/subwindow/", "_blank", "popup=true");
	}

	public registerWindow(win: Window, defaultPane: string, useHeader: boolean) {
		if (this._windows.has(win)) return;

		this._windows.add(win);
		this._project.requestUI(win, defaultPane, useHeader);
	}

	public closeAllSecondaryWindows(window: Window) {
		for (const win of this._windows) {
			if (win === window) continue;
			win.close();
		}
		this._windows.clear();
		this._windows.add(window);
	}
}

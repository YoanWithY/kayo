import { GPUX } from "./GPUX";
import { Project } from "./project/Project";
import WASMX from "./WASMX";
import { VirtualTextureSystem } from "./Textures/VirtualTextureSystem";
import RealtimeRenderer from "./rendering/RealtimeRenderer";
import { SceneRealtimeRepresentation } from "./rendering/SceneRealtimeRenderingRepresentation";
import { RenderConfig } from "../c/KayoCorePP";
import { Grid } from "./debug/Grid";
import { ConcurrentTaskQueue } from "./ressourceManagement/ConcurrentTaskQueue";
import { Viewport } from "./rendering/Viewport";
import { AnimationRenderer } from "./ui/panes/animation/AnimationRenderer";

export interface Renderer {
	renderViewport(timeStemp: number, viewport: Viewport): void;
	registeredViewports: Set<Viewport>;
	registerViewport(viewport: Viewport): void;
	unregisterViewport(viewport: Viewport): void;
}

export class Kayo {
	private _gpux: GPUX;
	private _wasmx: WASMX;
	private _taskQueue: ConcurrentTaskQueue;
	private _audioContext: AudioContext;
	private _virtualTextureSystem: VirtualTextureSystem;
	private _renderers: { [key: string]: Renderer } = {};
	private _windows: Set<Window>;
	private _rootName: string;
	private _project: Project;

	public constructor(gpux: GPUX, wasmx: WASMX, taskQueue: ConcurrentTaskQueue, rootName: string) {
		this._wasmx = wasmx;
		this._gpux = gpux;
		this._taskQueue = taskQueue;
		this._audioContext = new AudioContext({ latencyHint: "interactive" });
		this._virtualTextureSystem = new VirtualTextureSystem(this);
		const realtimeRenderer = new RealtimeRenderer(this);
		const animationRenderer = new AnimationRenderer(this);
		this._renderers[RealtimeRenderer.rendererKey] = realtimeRenderer;
		this._renderers[AnimationRenderer.rendererKey] = animationRenderer;
		this._windows = new Set();
		this._rootName = rootName;
		this._project = new Project(this);

		const config = this._wasmx.kayoInstance.project.renderConfigs.get(RealtimeRenderer.rendererKey) as RenderConfig;
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

	public get taskQueue(): ConcurrentTaskQueue {
		return this._taskQueue;
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

	public get rootName(): string {
		return this._rootName;
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

import Scene from "./Scene";
import { WrappingPane } from "../ui/Wrapping/WrappingPane";
import { Kayo } from "../Kayo";
import { Renderer } from "../Renderer";
import { PTPBase } from "../collaborative/PTPBase";
import { PerformancePane } from "../ui/panes/PerformancePane";
import { Viewport } from "../rendering/Viewport";
import { TaskQueue } from "../ressourceManagement/TaskQueue";
import { SceneRealtimeRepresentation } from "../rendering/SceneRealtimeRepresentation";
import RealtimeRenderer from "../rendering/RealtimeRenderer";
import { Grid } from "../debug/Grid";
import { AnimationRenderer } from "../ui/panes/animation/AnimationRenderer";
import { RenderConfig } from "../../c/KayoCorePP";

export class Project {
	private _name: string;
	private _fsRootName: string;
	private _taskQueue!: TaskQueue;
	private _renderers: { [key: string]: Renderer } = {};
	protected kayo: Kayo;
	public scene!: Scene;
	public ptpBase: PTPBase;

	public constructor(kayo: Kayo, fsRootName: string) {
		this._name = "Unnamed Project";
		this._fsRootName = fsRootName;
		this.kayo = kayo;
		this.ptpBase = new PTPBase(this);
		this.scene = new Scene();
	}

	public get name() {
		return this._name;
	}
	public get fsRootName(): string {
		return this._fsRootName;
	}
	public get taskQueue() {
		return this._taskQueue;
	}
	public get renderers() {
		return this._renderers;
	}

	public open(onFinishCallback?: () => void) {
		const taskQueue = new TaskQueue(this);
		const initCallback = () => {
			this._taskQueue = taskQueue;

			const realtimeRenderer = new RealtimeRenderer(
				this.kayo,
				this.kayo.wasmx.kayoInstance.project.renderConfigs.get("realtime default") as RenderConfig,
			);
			const animationRenderer = new AnimationRenderer(this.kayo);
			this._renderers["realtime default"] = realtimeRenderer;
			this._renderers[AnimationRenderer.rendererKey] = animationRenderer;
			this.scene.setRepresentation(
				new SceneRealtimeRepresentation(
					this.kayo,
					this.kayo.renderers["realtime default"] as RealtimeRenderer,
					this.scene,
				),
			);
			this.scene.addGrid(new Grid());

			if (onFinishCallback) onFinishCallback();
		};
		taskQueue.initWorkers().then(initCallback);
	}

	public close(onFinishCallback?: () => void) {
		// TODO: clean up renderes and workers and other ressources.;
		if (onFinishCallback) onFinishCallback();
	}

	public requestUI(win: Window, defaultPane: string, useHeader: boolean) {
		win.document.body.appendChild(WrappingPane.createWrappingPane(win, this.kayo, defaultPane, useHeader));
	}

	private requestedAnimationFrameForWindow: Map<Window, boolean> = new Map<Window, boolean>();
	private viewportsToUpdate = new Set<Viewport>();
	public performancePanes = new Set<PerformancePane>();
	public requestAnimationFrameWith(viewport: Viewport) {
		this.viewportsToUpdate.add(viewport);

		if (this.requestedAnimationFrameForWindow.get(viewport.window)) return;
		this.requestedAnimationFrameForWindow.set(viewport.window, true);

		const windowAnimationFrame = (ts: number) => {
			for (const v of this.viewportsToUpdate) {
				if (v.window != viewport.window) continue;
				const renderer = this.kayo.renderers[v.rendererKey];
				if (!renderer) {
					console.error(`Renderer with key "${v.rendererKey}" is not know to kayo.`);
					continue;
				}
				if (!renderer.registeredViewports.has(v)) {
					console.error(`Viewport "${v}" is not registered on renderer ${renderer}`);
					continue;
				}
				renderer.renderViewport(ts, v);
				this.viewportsToUpdate.delete(v);
			}

			for (const p of this.performancePanes) p.render();
			this.requestedAnimationFrameForWindow.set(viewport.window, false);
		};
		viewport.window.requestAnimationFrame(windowAnimationFrame);
	}

	private _viewports = new Set<Viewport>();
	public registerViewport(viewport: Viewport) {
		const renderer = this.kayo.renderers[viewport.rendererKey];
		if (!renderer) {
			console.error(`Renderer with key "${viewport.rendererKey}" is not know to kayo.`);
			return;
		}
		this._viewports.add(viewport);
		renderer.registerViewport(viewport);
	}

	public unregisterViewport(viewport: Viewport) {
		const renderer = this.kayo.renderers[viewport.rendererKey];
		if (!renderer) {
			console.error(`Renderer with key "${viewport.rendererKey}" is not know to kayo.`);
			return;
		}
		this._viewports.delete(viewport);
		renderer.unregisterViewport(viewport);
	}

	public get viewportPanes() {
		return this._viewports;
	}

	public fullRerender() {
		for (const vp of this._viewports) this.requestAnimationFrameWith(vp);
	}
}

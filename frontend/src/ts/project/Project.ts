import RealtimeRenderer from "../rendering/RealtimeRenderer";
import Scene from "./Scene";
import { WrappingPane } from "../ui/Wrapping/WrappingPane";
import { GPUX } from "../GPUX";
import Background from "../lights/Background";
import TextureUtils from "../Textures/TextureUtils";
import { Kayo } from "../Kayo";
import { PTPBase } from "../collaborative/PTPBase";
import WASMX from "../WASMX";
import { Grid } from "../debug/GridPipeline";
import { ViewportPane } from "../ui/panes/ViewportPane";
import { PerformancePane } from "../ui/panes/PerformancePane";
import { Viewport } from "../rendering/Viewport";
import { VirtualTextureSystem } from "../Textures/VirtualTextureSystem";

export class Project {
	private _name: string;
	public kayo: Kayo;
	public gpux: GPUX;
	public wasmx: WASMX;
	public renderers: { [key: string]: RealtimeRenderer } = {};
	public virtualTextureSystem: VirtualTextureSystem;
	public scene!: Scene;
	public ptpBase: PTPBase;

	public constructor(kayo: Kayo) {
		this._name = "Unnamed";
		window.document.title = `Kayo Engine - ${this._name}`;
		this.kayo = kayo;
		this.gpux = kayo.gpux;
		this.wasmx = kayo.wasmx;
		this.virtualTextureSystem = new VirtualTextureSystem(this.gpux, this.wasmx);
		const realtimeRenderer = new RealtimeRenderer(this);
		this.renderers["realtime"] = realtimeRenderer;
		this.ptpBase = new PTPBase(this);

		TextureUtils.init(this.gpux.gpuDevice);
		Background.init(this.gpux.gpuDevice, realtimeRenderer.bindGroup0Layout);
		Grid.init(this.gpux, realtimeRenderer.bindGroup0Layout);

		this.scene = new Scene();
		this.scene.background = new Background(this);
		this.scene.grid = new Grid(this);
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

		viewport.window.requestAnimationFrame((ts: number) => {
			for (const v of this.viewportsToUpdate) {
				if (v.window != viewport.window) continue;
				const renderer = this.renderers[viewport.configKey];
				if (!renderer) {
					console.error(`Renderer with key "${viewport.configKey}" is not know to kayo.`);
					continue;
				}
				if (!renderer.registeredViewports.has(viewport)) {
					console.error(`Viewport "${viewport}" is not registered on renderer ${renderer}`);
					continue;
				}
				renderer.renderViewport(ts, v);
				this.viewportsToUpdate.delete(v);
			}

			for (const p of this.performancePanes) p.render();

			this.requestedAnimationFrameForWindow.set(viewport.window, false);
		});
	}

	private _viewportPanes = new Set<ViewportPane>();
	public registerViewportPane(viewport: ViewportPane) {
		const renderer = this.renderers[viewport.configKey];
		if (!renderer) {
			console.error(`Renderer with key "${viewport.configKey}" is not know to kayo.`);
			return;
		}
		this._viewportPanes.add(viewport);
		renderer.registerViewport(viewport);
	}

	public unregisterViewportPane(viewport: ViewportPane) {
		const renderer = this.renderers[viewport.configKey];
		if (!renderer) {
			console.error(`Renderer with key "${viewport.configKey}" is not know to kayo.`);
			return;
		}
		this._viewportPanes.delete(viewport);
		renderer.unregisterViewport(viewport);
	}

	public get viewportPanes() {
		return this._viewportPanes;
	}

	public fullRerender() {
		for (const vp of this._viewportPanes) this.requestAnimationFrameWith(vp);
	}
}

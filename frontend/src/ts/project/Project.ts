import Scene from "./Scene";
import { WrappingPane } from "../ui/Wrapping/WrappingPane";
import { GPUX } from "../GPUX";
import { Kayo } from "../Kayo";
import { PTPBase } from "../collaborative/PTPBase";
import WASMX from "../WASMX";
import { ViewportPane } from "../ui/panes/ViewportPane";
import { PerformancePane } from "../ui/panes/PerformancePane";
import { Viewport } from "../rendering/Viewport";

export class Project {
	private _name: string;
	protected kayo: Kayo;
	protected gpux: GPUX;
	protected wasmx: WASMX;
	public scene!: Scene;
	public ptpBase: PTPBase;

	public constructor(kayo: Kayo) {
		this._name = "Unnamed Project";
		window.document.title = `Kayo Engine - ${this._name}`;
		this.kayo = kayo;
		this.gpux = kayo.gpux;
		this.wasmx = kayo.wasmx;
		this.ptpBase = new PTPBase(this);
		this.scene = new Scene();
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
				const renderer = this.kayo.renderers[viewport.configKey];
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
		const renderer = this.kayo.renderers[viewport.configKey];
		if (!renderer) {
			console.error(`Renderer with key "${viewport.configKey}" is not know to kayo.`);
			return;
		}
		this._viewportPanes.add(viewport);
		renderer.registerViewport(viewport);
	}

	public unregisterViewportPane(viewport: ViewportPane) {
		const renderer = this.kayo.renderers[viewport.configKey];
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

	public getFSPathTo(localPath: string) {
		return `${this.kayo.fileRessourceManager.projectRootName}/${localPath}`;
	}
}

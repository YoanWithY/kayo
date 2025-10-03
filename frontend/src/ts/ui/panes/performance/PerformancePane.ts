import { Kayo } from "../../../Kayo";
import { Viewport } from "../../../rendering/Viewport";
import { PerformanceRenderer } from "./PerformanceRenderer";

export class PerformancePane extends HTMLElement implements Viewport {
	private _kayo!: Kayo;
	private _win!: Window;
	private _canvas!: HTMLCanvasElement;
	private _ctx!: CanvasRenderingContext2D;

	private _resizeCallback: ResizeObserverCallback = (e) => {
		const size = e[0].devicePixelContentBoxSize[0];
		this._canvas.width = size.inlineSize;
		this._canvas.height = size.blockSize;
		this._kayo.project.requestAnimationFrameWith(this);
	};
	private _resizeObserver: ResizeObserver = new ResizeObserver(this._resizeCallback);
	public get rendererKey(): string {
		return PerformanceRenderer.rendererKey;
	}
	public get canvasContext(): CanvasRenderingContext2D {
		return this._ctx;
	}
	public get lable(): string {
		return "Performance Pane";
	}
	public get window() {
		return this._win;
	}

	protected connectedCallback() {
		this._resizeObserver.observe(this, {
			box: "device-pixel-content-box",
		});
		this._kayo.project.registerViewport(this);
		this._kayo.project.fullRerender();
	}

	protected disconnectedCallback() {
		this._resizeObserver.unobserve(this);
		this._kayo.project.unregisterViewport(this);
	}

	public static createUIElement(win: Window, kayo: Kayo): PerformancePane {
		const p = win.document.createElement(this.getDomClass()) as PerformancePane;
		p._win = win;
		p._kayo = kayo;
		p._canvas = win.document.createElement("canvas");
		p._ctx = p._canvas.getContext("2d") as CanvasRenderingContext2D;
		p.appendChild(p._canvas);
		return p;
	}

	public static getDomClass(): string {
		return "performance-pane";
	}

	public static getName() {
		return "Performance";
	}
}

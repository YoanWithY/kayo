import { Kayo } from "../../../../Kayo";
import { Viewport } from "../../../../rendering/Viewport";
import { SVTDebugRenderer } from "./SVTDebugRenderer";

export class SVTDebugPanel extends HTMLElement implements Viewport {
	private _kayo!: Kayo;
	private _win!: Window;
	private _canvas!: HTMLCanvasElement;
	private _canvasContext!: GPUCanvasContext;

	private _resizeCallback: ResizeObserverCallback = (e) => {
		const size = e[0].devicePixelContentBoxSize[0];
		this._canvas.width = size.inlineSize;
		this._canvas.height = size.blockSize;
		this._kayo.project.requestAnimationFrameWith(this);
	};
	private _resizeObserver: ResizeObserver = new ResizeObserver(this._resizeCallback);
	public get rendererKey(): string {
		return SVTDebugRenderer.rendererKey;
	}
	public get lable(): string {
		return "SVT Debug Panel";
	}
	public get window() {
		return this._win;
	}
	public get canvasContext() {
		return this._canvasContext;
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

	public static createUIElement(win: Window, kayo: Kayo): SVTDebugPanel {
		const p = win.document.createElement(this.getDomClass()) as SVTDebugPanel;
		p._win = win;
		p._kayo = kayo;
		p._canvas = win.document.createElement("canvas");
		p.appendChild(p._canvas);
		p._canvasContext = p._canvas.getContext("webgpu") as GPUCanvasContext;
		p._canvasContext.configure({
			device: kayo.gpux.gpuDevice,
			format: kayo.gpux.gpu.getPreferredCanvasFormat(),
			alphaMode: "opaque",
			colorSpace: "srgb",
			toneMapping: {
				mode: "standard",
			},
		});

		return p;
	}

	public static getDomClass(): string {
		return "svt-panel";
	}

	public static getName() {
		return "SVT";
	}
}

import { Kayo, Renderer } from "../../Kayo";
import BasicPane from "./BasicPane";
import animationPaneTemplate from "./AnimationPane.json";
import { Viewport2D } from "../../rendering/Viewport";

export class AnimationRenderer implements Renderer {
	protected _kayo: Kayo;
	public constructor(kayo: Kayo) {
		this._kayo = kayo;
	}
	public renderViewport(timeStamp: number, viewport: Viewport2D): void {
		// const KN = this._kayo.wasmx.Number;
		console.log(timeStamp, viewport);
		const ctx = viewport.canvasContext;
		ctx.fillStyle = "red";
		// const timeLine = this._kayo.wasmx.kayoInstance.project.timeLine;
	}
	public registeredViewports: Set<Viewport2D> = new Set();
	public registerViewport(viewport: Viewport2D): void {
		this.registeredViewports.add(viewport);
	}
	public unregisterViewport(viewport: Viewport2D): void {
		this.registeredViewports.delete(viewport);
	}
	public static readonly rendererKey = "animation";
}

export class AnimationPane extends BasicPane implements Viewport2D {
	private _ctx!: CanvasRenderingContext2D;
	private _win!: Window;
	private _canvas!: HTMLCanvasElement;

	private _resizeCallback = (e: ResizeObserverEntry[]) => {
		const size = e[0].devicePixelContentBoxSize[0];
		this._canvas.width = size.inlineSize;
		this._canvas.height = size.blockSize;
		if (this.isConnected) this._kayo.project.requestAnimationFrameWith(this);
	};
	private _resizeObserver: ResizeObserver = new ResizeObserver(this._resizeCallback);

	public get canvasContext(): CanvasRenderingContext2D {
		return this._ctx;
	}
	public get lable(): string {
		return "Animation Pane";
	}
	public get window(): Window {
		return this._win;
	}
	public get configKey(): string {
		return "animation";
	}

	protected connectedCallback() {
		this._kayo.project.registerViewport(this);
		this._resizeObserver.observe(this, {
			box: "device-pixel-content-box",
		});
	}

	protected disconnectedCallback() {
		this._kayo.project.unregisterViewport(this);
		this._resizeObserver.unobserve(this);
	}

	public static createUIElement(win: Window, kayo: Kayo): AnimationPane {
		const p = super.createUIElement(win, kayo, animationPaneTemplate) as AnimationPane;
		p._win = win;
		p._canvas = win.document.createElement("canvas");
		const ctx = p._canvas.getContext("2d");
		if (ctx === null) {
			console.error("2D Context for animation pane is NULL!");
			return p;
		}
		p._ctx = ctx;
		p.appendChild(p._canvas);
		return p;
	}

	public static getDomClass(): string {
		return "animation-pane";
	}

	public static getName() {
		return "Animation";
	}
}

import { Kayo, Renderer } from "../../Kayo";
import BasicPane from "./BasicPane";
import animationPaneTemplate from "./AnimationPane.json";
import { Viewport2D } from "../../rendering/Viewport";
import { KayoNumber } from "../../../c/KayoCorePP";

export class AnimationRenderer implements Renderer {
	public registeredViewports: Set<Viewport2D> = new Set();
	protected _kayo: Kayo;
	public constructor(kayo: Kayo) {
		this._kayo = kayo;
	}
	public renderViewport(_: number, viewport: Viewport2D): void {
		const KN = this._kayo.wasmx.KN;
		const ctx = viewport.canvasContext;
		const canvas = ctx.canvas;
		const dpr = viewport.window.devicePixelRatio;
		ctx.lineWidth = dpr;
		ctx.strokeStyle = "white";

		const startXa = viewport.origin[0];
		const startYa = viewport.origin[1];

		const rangeXa = KN.ndiv(canvas.width, viewport.contentScale[0]);
		const endXa = KN.add(startXa, rangeXa);
		const rangeYa = KN.ndiv(canvas.height, viewport.contentScale[1]);
		const endYa = KN.add(startYa, rangeYa);
		const curve = this._kayo.wasmx.kayoInstance.project.timeLine.simulationTimeVelocity.curve;
		ctx.beginPath();
		for (let x = 0; x < canvas.width; x += 1) {
			const Xa = KN.nremap(x, 0, canvas.width, startXa, endXa);
			const Ya = curve.sample(Xa);
			const y = KN.remapn(Ya, startYa, endYa, 0, canvas.height);

			if (x == 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();
	}
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
	private _origin!: [KayoNumber, KayoNumber];
	private _contentScale!: [KayoNumber, KayoNumber];

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
	public get rendererKey(): string {
		return "animation";
	}
	public get origin(): [KayoNumber, KayoNumber] {
		return this._origin;
	}
	public get contentScale(): [KayoNumber, KayoNumber] {
		return this._contentScale;
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
		const KN = kayo.wasmx.KN;
		p._origin = [KN.fromDouble(-100), KN.fromDouble(100)];
		p._contentScale = [KN.fromDouble(1), KN.fromDouble(-1)];
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

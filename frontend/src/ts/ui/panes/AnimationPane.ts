import { Kayo, Renderer } from "../../Kayo";
import BasicPane from "./BasicPane";
import animationPaneTemplate from "./AnimationPane.json";
import { Viewport2D } from "../../rendering/Viewport";
import { KayoNumber } from "../../../c/KayoCorePP";
import { linearStep } from "../../math/math";
import { getWindowZoom } from "../../Utils";

export class AnimationRenderer implements Renderer {
	public registeredViewports: Set<Viewport2D> = new Set();
	protected _kayo: Kayo;
	public constructor(kayo: Kayo) {
		this._kayo = kayo;
	}

	private _renderBackgroundGrid(viewport: Viewport2D) {
		const KN = this._kayo.wasmx.KN;
		const ctx = viewport.canvasContext;
		const canvas = ctx.canvas;
		const dpr = viewport.window.devicePixelRatio;

		const startXa = viewport.origin[0];
		const startYa = viewport.origin[1];

		ctx.strokeStyle = "white";
		ctx.globalAlpha = 0.1;
		for (const gap of [1, 10, 100, 1000, 10000, 100000, 1000000]) {
			const offsetXpx = -viewport.contentScale[0] * KN.modn(startXa, gap);
			const offsetYpx = -viewport.contentScale[1] * KN.modn(startYa, gap);

			let gapPx = Math.abs(viewport.contentScale[0]) * gap;
			let widthScale = linearStep(gapPx, 5 * dpr, 50 * dpr);
			ctx.lineWidth = dpr * widthScale;
			if (widthScale > 0) {
				ctx.beginPath();
				for (let x = offsetXpx; x <= canvas.width + gapPx; x += gapPx) {
					ctx.moveTo(x, 0);
					ctx.lineTo(x, canvas.height);
				}
				ctx.stroke();
			}

			gapPx = Math.abs(viewport.contentScale[1]) * gap;
			widthScale = linearStep(gapPx, 5 * dpr, 50 * dpr);
			ctx.lineWidth = dpr * widthScale;
			if (widthScale > 0) {
				ctx.beginPath();
				for (let y = offsetYpx; y <= canvas.height + gapPx; y += gapPx) {
					ctx.moveTo(0, y);
					ctx.lineTo(canvas.width, y);
				}
				ctx.stroke();
			}
		}

		ctx.font = "50px sans";
		ctx.fillStyle = "white";

		ctx.globalAlpha = 1.0;
		ctx.fillText(`${KN.toDouble(startXa)}, ${KN.toDouble(startYa)} | ${viewport.contentScale}`, 0, 100);
	}

	public renderViewport(_: number, viewport: Viewport2D): void {
		const wasmx = this._kayo.wasmx;
		const KN = this._kayo.wasmx.KN;
		const ctx = viewport.canvasContext;
		const canvas = ctx.canvas;
		const dpr = viewport.window.devicePixelRatio;
		ctx.reset();

		this._renderBackgroundGrid(viewport);

		const startXa = viewport.origin[0];
		const startYa = viewport.origin[1];
		const rangeXa = canvas.width / viewport.contentScale[0];
		const endXa = KN.addn(startXa, rangeXa);
		const rangeYa = canvas.height / viewport.contentScale[1];
		const endYa = KN.addn(startYa, rangeYa);
		const curve = this._kayo.wasmx.kayoInstance.project.timeLine.simulationTimeVelocity;

		const firstIndex = curve.getSegmentIndexAt(startXa);
		const lastIndex = curve.getSegmentIndexAt(endXa);

		if (firstIndex < 0 || lastIndex < 0) {
			console.error("FCuve index out of bounds");
			return;
		}

		for (let segmentIndex = firstIndex; segmentIndex <= lastIndex; segmentIndex++) {
			const segment = curve.segments.get(segmentIndex);
			if (!segment) {
				console.error("Curve segment is null!");
				continue;
			}
			const curveSegment = segment.getCurveSegment();
			if (!curveSegment) {
				console.error("Curve segment curve is null!");
				continue;
			}
			const doublePtr = curveSegment.sampleRangeAuto(
				startXa,
				endXa,
				startYa,
				endYa,
				0,
				canvas.width,
				0,
				canvas.height,
				1,
			);
			const points = wasmx.getFloat64View(doublePtr);

			ctx.beginPath();
			ctx.lineWidth = dpr;
			ctx.strokeStyle = "white";
			ctx.moveTo(points[0], points[1]);
			for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
			ctx.stroke();

			wasmx.deleteFloat64Array(doublePtr);
		}
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
	private _contentScale!: [number, number];

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
	public get contentScale(): [number, number] {
		return this._contentScale;
	}

	private _pointerDown = false;
	private _pointerDownCallback = (e: PointerEvent) => {
		if (e.pointerType != "touch") this._pointerDown = true;
	};
	private _pointerUpCallback = (_: PointerEvent) => {
		this._pointerDown = false;
	};

	private _mapToSourceX(x: number) {
		const KN = this._kayo.wasmx.KN;
		const rangeXa = this._canvas.width / this._contentScale[0];
		const endXa = KN.addn(this._origin[0], rangeXa);
		return KN.nremap(x, 0, this._canvas.width, this._origin[0], endXa);
	}

	private _mapToSourceY(y: number) {
		const KN = this._kayo.wasmx.KN;
		const rangeYa = this._canvas.height / this._contentScale[1];
		const endYa = KN.addn(this._origin[1], rangeYa);
		return KN.nremap(y, 0, this._canvas.height, this._origin[1], endYa);
	}

	private _mapToSource(x: number, y: number) {
		return [this._mapToSourceX(x), this._mapToSourceY(y)];
	}

	private _pointerMoveCallback = (e: PointerEvent) => {
		if (!this._pointerDown) return;
		const KN = this._kayo.wasmx.KN;
		this._origin[0] = KN.subn(this._origin[0], (e.movementX / this.contentScale[0]) * this.window.devicePixelRatio);
		this._origin[1] = KN.subn(this._origin[1], (e.movementY / this.contentScale[1]) * this.window.devicePixelRatio);
		this._kayo.project.requestAnimationFrameWith(this);
	};

	private _wheelCallback = (e: WheelEvent) => {
		const dpr = this.window.devicePixelRatio;
		const KN = this._kayo.wasmx.KN;
		if (e.deltaMode == 0) {
			const oldSource = this._mapToSource(e.offsetX * dpr, e.offsetY * dpr);
			this._contentScale[0] -= (this._contentScale[0] * e.deltaY) / 512;
			this._contentScale[1] -= (this._contentScale[1] * e.deltaY) / 512;
			const newSource = this._mapToSource(e.offsetX * dpr, e.offsetY * dpr);
			this._origin[0] = KN.add(this._origin[0], KN.sub(oldSource[0], newSource[0]));
			this._origin[1] = KN.add(this._origin[1], KN.sub(oldSource[1], newSource[1]));
		}
		this._kayo.project.requestAnimationFrameWith(this);
	};

	private _prevTouch: { [key: number]: Touch } = {};
	private _touchStartCallback = (e: TouchEvent) => {
		for (const t of e.changedTouches) this._prevTouch[t.identifier] = t;
	};

	private _getOffsetX(e: TouchEvent, t: Touch) {
		const target = e.target as HTMLElement;
		if (!target) return NaN;
		return t.clientX - target.getBoundingClientRect().left;
	}

	private _getOffsetY(e: TouchEvent, t: Touch) {
		const target = e.target as HTMLElement;
		if (!target) return NaN;
		return t.clientY - target.getBoundingClientRect().top;
	}

	private _touchMoveCallback = (e: TouchEvent) => {
		const KN = this._kayo.wasmx.KN;
		const dpr = this.window.devicePixelRatio;
		const winZoom = getWindowZoom(this.window);
		if (e.touches.length === 1) {
			const touch = e.changedTouches[0];
			const prevTouch = this._prevTouch[touch.identifier];
			const movementX = (touch.screenX - prevTouch.screenX) / winZoom;
			const movementY = (touch.screenY - prevTouch.screenY) / winZoom;
			this._origin[0] = KN.subn(this._origin[0], (movementX / this.contentScale[0]) * dpr);
			this._origin[1] = KN.subn(this._origin[1], (movementY / this.contentScale[1]) * dpr);
			this._kayo.project.requestAnimationFrameWith(this);
		} else if (e.touches.length === 2) {
			const thisTouch0 = e.touches[0];
			const thisTouch1 = e.touches[1];
			const prevTouch0 = this._prevTouch[thisTouch0.identifier];
			const prevTouch1 = this._prevTouch[thisTouch1.identifier];

			const prevDx = Math.abs(prevTouch0.screenX - prevTouch1.screenX) / winZoom;
			const thisDx = Math.abs(thisTouch0.screenX - thisTouch1.screenX) / winZoom;
			const zoomX = thisDx >= 32 && prevDx >= 32 ? thisDx / prevDx : 1;

			const prevDy = Math.abs(prevTouch0.screenY - prevTouch1.screenY) / winZoom;
			const thisDy = Math.abs(thisTouch0.screenY - thisTouch1.screenY) / winZoom;
			const zoomY = thisDy >= 32 && prevDy >= 32 ? thisDy / prevDy : 1;

			const oldSource = this._mapToSource(
				(this._getOffsetX(e, prevTouch0) * dpr) / winZoom,
				(this._getOffsetY(e, prevTouch0) * dpr) / winZoom,
			);
			this._contentScale[0] *= zoomX;
			this._contentScale[1] *= zoomY;
			const newSource = this._mapToSource(
				(this._getOffsetX(e, thisTouch0) * dpr) / winZoom,
				(this._getOffsetY(e, thisTouch0) * dpr) / winZoom,
			);
			this._origin[0] = KN.add(this._origin[0], KN.sub(oldSource[0], newSource[0]));
			this._origin[1] = KN.add(this._origin[1], KN.sub(oldSource[1], newSource[1]));
			this._kayo.project.requestAnimationFrameWith(this);
		}

		for (const t of e.changedTouches) this._prevTouch[t.identifier] = t;
	};

	protected connectedCallback() {
		this._kayo.project.registerViewport(this);
		this._resizeObserver.observe(this, {
			box: "device-pixel-content-box",
		});

		this.addEventListener("pointermove", this._pointerMoveCallback);
		this.addEventListener("pointerdown", this._pointerDownCallback);
		this.addEventListener("pointerup", this._pointerUpCallback);
		this.addEventListener("wheel", this._wheelCallback, { passive: true });
		this.addEventListener("touchstart", this._touchStartCallback, { passive: true });
		this.addEventListener("touchmove", this._touchMoveCallback, { passive: true });
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
		p._contentScale = [1, -1];
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

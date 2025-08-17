import { Kayo } from "../../Kayo";
import BasicPane from "./BasicPane";
import animationPaneTemplate from "./AnimationPane.json";
import { Viewport2D } from "../../rendering/Viewport";
import { KayoNumber } from "../../../c/KayoCorePP";
import { getWindowZoom } from "../../Utils";

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

	private _prevPointerEvents: { [key: number]: PointerEvent } = {};
	private _pointerDownCallback = (e: PointerEvent) => {
		this._prevPointerEvents[e.pointerId] = e;
	};
	private _pointerUpCallback = (e: PointerEvent) => {
		delete this._prevPointerEvents[e.pointerId];
	};

	private _pointerMoveCallback = (e: PointerEvent) => {
		const KN = this._kayo.wasmx.KN;
		const dpr = this.window.devicePixelRatio;
		const winZoom = getWindowZoom(this.window);
		const pointeCount = Object.keys(this._prevPointerEvents).length;
		if (pointeCount === 0) return;

		if (pointeCount === 1) {
			const prevPointer = this._prevPointerEvents[e.pointerId];
			const movementX = (e.screenX - prevPointer.screenX) / winZoom;
			const movementY = (e.screenY - prevPointer.screenY) / winZoom;
			this._origin[0] = KN.subn(this._origin[0], (movementX / this.contentScale[0]) * dpr);
			this._origin[1] = KN.subn(this._origin[1], (movementY / this.contentScale[1]) * dpr);
			this._kayo.project.requestAnimationFrameWith(this);
		} else if (pointeCount === 2) {
			const thisPointer = e;
			const prevPointer = this._prevPointerEvents[thisPointer.pointerId];
			const otherPointer = Object.values(this._prevPointerEvents).find(
				(v) => v.pointerId != thisPointer.pointerId,
			);
			if (!otherPointer) {
				console.error("Could not find other pointer!");
				return;
			}

			const prevDx = Math.abs(prevPointer.screenX - otherPointer.screenX) / winZoom;
			const thisDx = Math.abs(thisPointer.screenX - otherPointer.screenX) / winZoom;
			const zoomX = thisDx >= 32 && prevDx >= 32 ? thisDx / prevDx : 1;

			const prevDy = Math.abs(prevPointer.screenY - otherPointer.screenY) / winZoom;
			const thisDy = Math.abs(thisPointer.screenY - otherPointer.screenY) / winZoom;
			const zoomY = thisDy >= 32 && prevDy >= 32 ? thisDy / prevDy : 1;

			console.log(thisPointer.screenX, prevPointer.screenX, otherPointer.screenX);

			const oldSource = this._mapToSource(
				(prevPointer.offsetX * dpr) / winZoom,
				(prevPointer.offsetY * dpr) / winZoom,
			);
			this._contentScale[0] *= zoomX;
			this._contentScale[1] *= zoomY;
			const newSource = this._mapToSource(
				(thisPointer.offsetX * dpr) / winZoom,
				(thisPointer.offsetY * dpr) / winZoom,
			);
			this._origin[0] = KN.add(this._origin[0], KN.sub(oldSource[0], newSource[0]));
			this._origin[1] = KN.add(this._origin[1], KN.sub(oldSource[1], newSource[1]));
			this._kayo.project.requestAnimationFrameWith(this);
		}

		this._prevPointerEvents[e.pointerId] = e;
		this._kayo.project.requestAnimationFrameWith(this);
	};

	private _wheelCallback = (e: WheelEvent) => {
		const dpr = this.window.devicePixelRatio;
		const KN = this._kayo.wasmx.KN;
		const winZoom = getWindowZoom(this.window);
		if (e.deltaMode == 0) {
			const oldSource = this._mapToSource(e.offsetX * dpr, e.offsetY * dpr);
			this._contentScale[0] -= ((this._contentScale[0] * e.deltaY) / 512) * winZoom;
			this._contentScale[1] -= ((this._contentScale[1] * e.deltaY) / 512) * winZoom;
			const newSource = this._mapToSource(e.offsetX * dpr, e.offsetY * dpr);
			this._origin[0] = KN.add(this._origin[0], KN.sub(oldSource[0], newSource[0]));
			this._origin[1] = KN.add(this._origin[1], KN.sub(oldSource[1], newSource[1]));
		}
		this._kayo.project.requestAnimationFrameWith(this);
	};

	protected connectedCallback() {
		this._kayo.project.registerViewport(this);
		this._resizeObserver.observe(this, {
			box: "device-pixel-content-box",
		});

		this.addEventListener("pointerdown", this._pointerDownCallback);
		this.addEventListener("pointerup", this._pointerUpCallback);
		this.addEventListener("pointermove", this._pointerMoveCallback);
		this.addEventListener("wheel", this._wheelCallback, { passive: true });
	}

	protected disconnectedCallback() {
		this._kayo.project.unregisterViewport(this);
		this._resizeObserver.unobserve(this);
		this.removeEventListener("pointerdown", this._pointerDownCallback);
		this.removeEventListener("pointerup", this._pointerUpCallback);
		this.removeEventListener("pointermove", this._pointerMoveCallback);
		this.removeEventListener("wheel", this._wheelCallback);
	}

	public static createUIElement(win: Window, kayo: Kayo): AnimationPane {
		const p = super.createUIElement(win, kayo, animationPaneTemplate) as AnimationPane;
		p._win = win;
		p._canvas = win.document.createElement("canvas");
		const ctx = p._canvas.getContext("2d", { desynchronized: false, alpha: true, willReadFrequently: false });
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

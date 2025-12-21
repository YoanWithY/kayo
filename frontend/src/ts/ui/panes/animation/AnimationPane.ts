import { Kayo } from "../../../Kayo";
import { Viewport2D } from "../../../rendering/Viewport";
import { FCurveSegment, KayoNumber } from "../../../../c/KayoCorePP";
import { AnimationTool, animationTools, ViewTool } from "./AnimationTools";
import { clamp } from "../../../math/math";
import { RadioButton, RadioButtonWrapper } from "../../components/RadioButton";
import { isNoPointerButtonDown, isPointerButtonDown, PointerButtons } from "../../UIUtils";
import { AnimationRenderer } from "./AnimationRenderer";

export type PointerEventMap = { [key: number]: PointerEvent };

export class AnimationPane extends HTMLElement implements Viewport2D {
	private _kayo!: Kayo;
	private _ctx!: CanvasRenderingContext2D;
	private _win!: Window;
	private _canvas!: HTMLCanvasElement;
	private _origin!: [KayoNumber, KayoNumber];
	private _contentScale!: [number, number];
	private _viewTool!: ViewTool;
	private _activeTool!: AnimationTool;
	private _toolRadio!: RadioButtonWrapper;
	private _selectedSegments: FCurveSegment[] = [];
	private _activeSegment: FCurveSegment | undefined;

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
		return AnimationRenderer.rendererKey;
	}
	public get origin(): [KayoNumber, KayoNumber] {
		return this._origin;
	}
	public get contentScale(): [number, number] {
		return this._contentScale;
	}

	public get selectedSegments() {
		return this._selectedSegments;
	}

	public get activeSegment() {
		return this._activeSegment;
	}

	public mapToSourceX(x: number) {
		const KN = this._kayo.wasmx.KN;
		const rangeXa = this._canvas.width / this._contentScale[0];
		const endXa = KN.addn(this._origin[0], rangeXa);
		return KN.nremap(x, 0, this._canvas.width, this._origin[0], endXa);
	}

	public mapToSourceY(y: number) {
		const KN = this._kayo.wasmx.KN;
		const rangeYa = this._canvas.height / this._contentScale[1];
		const endYa = KN.addn(this._origin[1], rangeYa);
		return KN.nremap(y, 0, this._canvas.height, this._origin[1], endYa);
	}

	public mapToSource(x: number, y: number) {
		return [this.mapToSourceX(x), this.mapToSourceY(y)];
	}

	public mapToTargetX(x: KayoNumber) {
		const KN = this._kayo.wasmx.KN;
		const rangeXa = this._canvas.width / this._contentScale[0];
		const endXa = KN.addn(this._origin[0], rangeXa);
		return KN.remapn(x, this._origin[0], endXa, 0, this._canvas.width);
	}

	public mapToTargetY(y: KayoNumber) {
		const KN = this._kayo.wasmx.KN;
		const rangeYa = this._canvas.height / this._contentScale[1];
		const endYa = KN.addn(this._origin[1], rangeYa);
		return KN.remapn(y, this._origin[1], endYa, 0, this._canvas.height);
	}

	public mapToTarget(x: KayoNumber, y: KayoNumber) {
		return [this.mapToTargetX(x), this.mapToTargetY(y)];
	}

	public setClosestActive(e: PointerEvent) {
		const dpr = this.window.devicePixelRatio;
		const source = this.mapToSourceX(e.offsetX * dpr);
		const curve = this._kayo.wasmx.projectData.timeLine.simulationTimeVelocity;
		const index = curve.getSegmentIndexAt(source);
		this._activeSegment = curve.segments.get(index);
	}

	private _previousPointerEvents: PointerEventMap = {};
	public get previousPointerEvents() {
		return this._previousPointerEvents;
	}
	private _pointerDownCallback = (e: PointerEvent) => {
		if (isPointerButtonDown(e, PointerButtons.PRIMARY)) {
			this._activeTool.handlePointerDown(e);
		}
		this._previousPointerEvents[e.pointerId] = e;
	};
	private _pointerUpCallback = (e: PointerEvent) => {
		if (isPointerButtonDown(e, PointerButtons.PRIMARY)) {
			this._activeTool.handlePointerUp(e);
		}
		delete this._previousPointerEvents[e.pointerId];
	};

	private _pointerMoveCallback = (e: PointerEvent) => {
		if (isNoPointerButtonDown(e)) return;

		if (isPointerButtonDown(e, PointerButtons.PRIMARY)) {
			this._activeTool.handlePointerMove(e);
		} else if (isPointerButtonDown(e, PointerButtons.MIDDEL)) {
			this._viewTool.handlePointerMove(e);
		} else if (isPointerButtonDown(e, PointerButtons.SECONDARY)) {
			this._viewTool.handlePointerMove(e);
		}

		if (this._previousPointerEvents[e.pointerId] === undefined) {
			console.error(`Unknown pointer event id "${e.pointerId}" during poiner move.`);
		} else {
			this._previousPointerEvents[e.pointerId] = e;
		}
	};

	private _wheelCallback = (e: WheelEvent) => {
		this._viewTool.handleWheel(e);
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

	public setContentScale(x: number, y: number) {
		this._contentScale[0] = clamp(x, 0.00001, 100000);
		this._contentScale[1] = clamp(y, -100000, -0.00001);
	}

	public static createUIElement(win: Window, kayo: Kayo): AnimationPane {
		const p = win.document.createElement(this.getDomClass()) as AnimationPane;
		p._kayo = kayo;
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
		p._viewTool = new ViewTool(kayo, p);
		p._toolRadio = RadioButtonWrapper.createRadioButtonWrapper(win);

		const radioButtons = [];
		for (const toolName in animationTools) {
			const radioButtonCallback = () => {
				p._activeTool = new animationTools[toolName](kayo, p);
			};
			radioButtons.push(RadioButton.createRadioButton(win, p._toolRadio, toolName, radioButtonCallback));
		}
		p._toolRadio.setButtons(radioButtons);
		p._toolRadio.setActive(ViewTool.toolname);
		p.appendChild(p._toolRadio);
		return p;
	}

	public static getDomClass(): string {
		return "animation-pane";
	}

	public static getName() {
		return "Animation";
	}
}

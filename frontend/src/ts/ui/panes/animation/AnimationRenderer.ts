import { FCurveSegment } from "../../../../c/KayoCorePP";
import { Kayo, Renderer } from "../../../Kayo";
import { linearStep } from "../../../math/math";
import { Viewport2D } from "../../../rendering/Viewport";
import { getWindowZoom } from "../../../Utils";
import { AnimationPane } from "./AnimationPane";

const gridLineWidth = 1;
const gridAlpha = 0.1;
const gridColor = "white";

export class AnimationRenderer implements Renderer {
	public registeredViewports: Set<Viewport2D> = new Set();
	protected _kayo: Kayo;
	public constructor(kayo: Kayo) {
		this._kayo = kayo;
	}

	private _normalizeWidth(desiredLineWidth: number) {
		let practicalLineWidth = desiredLineWidth;
		let widthOpacityFactor = 1;
		if (practicalLineWidth < 1) {
			widthOpacityFactor = practicalLineWidth;
			practicalLineWidth = 1;
		}
		return { practicalLineWidth, widthOpacityFactor };
	}

	private _renderBackgroundGrid(viewport: Viewport2D) {
		const KN = this._kayo.wasmx.KN;
		const ctx = viewport.canvasContext;
		const canvas = ctx.canvas;
		const dpr = viewport.window.devicePixelRatio;
		const winZoom = getWindowZoom(viewport.window);

		const startXa = viewport.origin[0];
		const startYa = viewport.origin[1];

		ctx.strokeStyle = gridColor;
		for (const gap of [1, 10, 100, 1000, 10000, 100000, 1000000]) {
			const offsetXpx = -viewport.contentScale[0] * KN.modn(startXa, gap);
			const offsetYpx = -viewport.contentScale[1] * KN.modn(startYa, gap);

			let gapPx = Math.abs(viewport.contentScale[0]) * gap;
			let widthScale = linearStep(gapPx, (5 * dpr) / winZoom, (50 * dpr) / winZoom);
			if (widthScale > 0) {
				const { practicalLineWidth, widthOpacityFactor } = this._normalizeWidth(
					gridLineWidth * dpr * widthScale,
				);
				ctx.lineWidth = practicalLineWidth;
				ctx.globalAlpha = gridAlpha * widthOpacityFactor;
				ctx.beginPath();
				for (let x = offsetXpx; x <= canvas.width + gapPx; x += gapPx) {
					ctx.moveTo(x, 0);
					ctx.lineTo(x, canvas.height);
				}
				ctx.stroke();
			}

			gapPx = Math.abs(viewport.contentScale[1]) * gap;
			widthScale = linearStep(gapPx, (5 * dpr) / winZoom, (50 * dpr) / winZoom);
			if (widthScale > 0) {
				const { practicalLineWidth, widthOpacityFactor } = this._normalizeWidth(
					gridLineWidth * dpr * widthScale,
				);
				ctx.lineWidth = practicalLineWidth;
				ctx.globalAlpha = gridAlpha * widthOpacityFactor;
				ctx.beginPath();
				ctx.beginPath();
				for (let y = offsetYpx; y <= canvas.height + gapPx; y += gapPx) {
					ctx.moveTo(0, y);
					ctx.lineTo(canvas.width, y);
				}
				ctx.stroke();
			}
		}
		ctx.globalAlpha = 1.0;
	}

	public renderViewport(_: number, viewport: AnimationPane): void {
		const wasmx = this._kayo.wasmx;
		const KN = this._kayo.wasmx.KN;
		const ctx = viewport.canvasContext;
		if (ctx.isContextLost()) {
			console.error("Canvas 2D context lost.");
			return;
		}
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

		const drawSegment = (segment: FCurveSegment) => {
			const curveSegment = segment.getCurveSegment();
			if (!curveSegment) {
				console.error("Curve segment curve is null!");
				return;
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
			ctx.moveTo(points[0], points[1]);
			for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
			ctx.stroke();

			wasmx.deleteFloat64Array(doublePtr);
		};

		if (viewport.activeSegment) {
			ctx.globalAlpha = 0.5;
			ctx.lineWidth = dpr * 5;
			ctx.strokeStyle = "yellow";
			ctx.lineCap = "round";
			drawSegment(viewport.activeSegment);
		}

		// regular segments
		ctx.globalAlpha = 0.8;
		ctx.lineWidth = dpr;
		ctx.strokeStyle = "white";
		ctx.lineCap = "round";
		for (let segmentIndex = firstIndex; segmentIndex <= lastIndex; segmentIndex++) {
			const segment = curve.segments.get(segmentIndex);
			if (!segment) {
				console.error("Curve segment is null!");
				continue;
			}
			drawSegment(segment);
		}

		ctx.beginPath();
		ctx.fillStyle = "white";
		ctx.globalAlpha = 1;
		for (let knotIndex = firstIndex - 1; knotIndex <= lastIndex; knotIndex++) {
			if (knotIndex < 0 || knotIndex >= curve.knots.size()) continue;
			const knot = curve.knots.get(knotIndex);
			if (!knot) {
				console.error("Knot is null!");
				continue;
			}
			const p = (viewport as AnimationPane).mapToTarget(knot.x, knot.y);
			ctx.moveTo(p[0], p[1]);
			ctx.arc(p[0], p[1], 3 * dpr, 0, 2 * Math.PI);
		}
		ctx.fill();
	}
	public registerViewport(viewport: Viewport2D): void {
		this.registeredViewports.add(viewport);
	}
	public unregisterViewport(viewport: Viewport2D): void {
		this.registeredViewports.delete(viewport);
	}
	public static readonly rendererKey = "__kayo__animation";
}

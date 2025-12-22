import { Kayo } from "../../../../Kayo";
import { Renderer } from "../../../../Renderer";
import { ViewportPane } from "../../ViewportPane";
import { PerformancePanel } from "./PerformancePanel";

type TimeEntry = { [subtask: string]: number };
interface DrawVerticalStackedBarsOpts {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	data: TimeEntry[];
	subtasksOrder: string[]; // stacking order bottom→top
	subtaskColors: Record<string, string>;
	label: string;
	startY: number; // top Y position for chart and label
	chartHeight: number; // total height of bars
}

export class PerformanceRenderer implements Renderer {
	public static readonly rendererKey = "__kayo__performance";
	private _registeredViewports: Set<PerformancePanel>;
	private _kayo: Kayo;
	public constructor(kayo: Kayo) {
		this._kayo = kayo;
		this._registeredViewports = new Set();
	}

	public get registeredViewports() {
		return this._registeredViewports;
	}

	private _drawVerticalStackedBars(viewport: PerformancePanel, opts: DrawVerticalStackedBarsOpts): void {
		const { canvas, ctx, data, subtasksOrder, subtaskColors, label, startY, chartHeight } = opts;
		const count = data.length;
		const availableWidth = canvas.width;
		const barWidth = availableWidth > 0 ? Math.floor(availableWidth / count) : 0;

		// Compute maximum total duration for scaling Y-axis

		const mapping = (e: TimeEntry) => {
			const reducer = (s: any, k: string) => s + (e[k] || 0);
			return subtasksOrder.reduce(reducer, 0);
		};
		const totals = data.map(mapping);
		const maxTotal = Math.ceil(Math.max(...totals, 1) / 10) * 10;
		const scaleY = chartHeight / maxTotal;

		let js = 0;
		let render = 0;
		for (const e of data) {
			js += e["JavaScript"];
			render += e["Render"];
		}

		// Draw label
		ctx.font = `${viewport.window.devicePixelRatio}em sans-serif`;
		ctx.textBaseline = "top";
		ctx.fillStyle = "rgb(200, 200, 200)";
		ctx.fillText(
			`${label} - ${data.length} Frame AVG - JS: ${(js / data.length).toFixed(1)}ms | Render: ${(render / data.length).toFixed(1)}ms`,
			0,
			startY,
		);

		const labelHeight = parseInt(ctx.font, 10);
		const chartY = startY + labelHeight + 4;

		ctx.fillStyle = "rgb(50, 50, 50)";
		ctx.fillRect(0, chartY, availableWidth, chartHeight);

		// Draw bars

		let i = 0;
		for (const entry of data) {
			const x = i * barWidth;
			let accumulatedPx = 0;

			for (const key of subtasksOrder) {
				const value = entry[key] || 0;
				const h = value * scaleY;
				if (h > 0) {
					ctx.fillStyle = subtaskColors[key] ?? "#ccc";
					ctx.fillRect(x, chartY + chartHeight - accumulatedPx - h, barWidth, h);
				}
				accumulatedPx += h;
			}
			i++;
		}

		ctx.lineWidth = viewport.window.devicePixelRatio;
		for (let value = 0; value <= maxTotal; value++) {
			ctx.strokeStyle = `rgb(0 0 0 / ${value % 5 === 0 ? 100 : 50}%)`;
			const y = chartY + chartHeight - value * scaleY + 0.5; // center to avoid blur :contentReference[oaicite:1]{index=1}
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}
	}

	public renderViewport(_: number, viewport: PerformancePanel): void {
		const ctx = viewport.canvasContext;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		const chartHeight = 100 * viewport.window.devicePixelRatio;
		let h = 10 * viewport.window.devicePixelRatio;
		let i = 1;
		for (const v of this._kayo.project.viewports) {
			if (!(v instanceof ViewportPane)) continue;
			const d = [];
			for (let i = 0; i < v.timeRingeCach.length; i++)
				d.push(v.timeRingeCach[(v.timeRingeCachCurrentIndex + i) % v.timeRingeCach.length]);

			this._drawVerticalStackedBars(viewport, {
				canvas: ctx.canvas,
				ctx,
				data: d,
				subtasksOrder: ["JavaScript", "Render", "indexResolve", "Selection", "Overlays", "compositingTime"],
				subtaskColors: {
					JavaScript: "red",
					Render: "orange",
					indexResolve: "yellow",
					Selection: "green",
					Overlays: "blue",
					compositingTime: "purple",
				},
				label: `Viewport ${i++}`,
				startY: h,
				chartHeight,
			});
			h += chartHeight + 50 * viewport.window.devicePixelRatio;
		}
	}
	public registerViewport(viewport: PerformancePanel): void {
		this._registeredViewports.add(viewport);
	}
	public unregisterViewport(viewport: PerformancePanel): void {
		this._registeredViewports.delete(viewport);
	}
}

import { Kayo } from "../../Kayo";
import { ViewportPane } from "./ViewportPane";

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

export class PerformancePane extends HTMLElement {
	private _kayo!: Kayo;
	private _win!: Window;
	private _canvas!: HTMLCanvasElement;
	private _ctx!: CanvasRenderingContext2D;

	private _resizeCallback: ResizeObserverCallback = (e) => {
		const size = e[0].devicePixelContentBoxSize[0];
		this._canvas.width = size.inlineSize;
		this._canvas.height = size.blockSize;
		this.render();
	};
	private _resizeObserver: ResizeObserver = new ResizeObserver(this._resizeCallback);

	public get window() {
		return this._win;
	}

	private _drawVerticalStackedBars(opts: DrawVerticalStackedBarsOpts): void {
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
		ctx.font = `${this._win.devicePixelRatio}em sans-serif`;
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

		ctx.lineWidth = this._win.devicePixelRatio;
		for (let value = 0; value <= maxTotal; value++) {
			ctx.strokeStyle = `rgb(0 0 0 / ${value % 5 === 0 ? 100 : 50}%)`;
			const y = chartY + chartHeight - value * scaleY + 0.5; // center to avoid blur :contentReference[oaicite:1]{index=1}
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}
	}

	public render() {
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

		const chartHeight = 100 * this._win.devicePixelRatio;
		let h = 10 * this._win.devicePixelRatio;
		let i = 1;
		for (const v of this._kayo.project.viewportPanes) {
			if (!(v instanceof ViewportPane)) continue;
			const d = [];
			for (let i = 0; i < v.timeRingeCach.length; i++)
				d.push(v.timeRingeCach[(v.timeRingeCachCurrentIndex + i) % v.timeRingeCach.length]);

			this._drawVerticalStackedBars({
				canvas: this._canvas,
				ctx: this._ctx,
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
			h += chartHeight + 50 * this._win.devicePixelRatio;
		}
	}

	protected connectedCallback() {
		this._kayo.project.performancePanes.add(this);
		this._resizeObserver.observe(this, {
			box: "device-pixel-content-box",
		});
		this._kayo.project.fullRerender();
	}

	protected disconnectedCallback() {
		this._kayo.project.performancePanes.delete(this);
		this._resizeObserver.unobserve(this);
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

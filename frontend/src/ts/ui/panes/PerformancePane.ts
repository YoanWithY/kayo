import { Kayo } from "../../Kayo";
import BasicPane from "./BasicPane";
import performancePaneTemplate from "./PerformancePane.json";

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
	labelFont: string;
}

export class PerformancePane extends BasicPane {
	private _win!: Window;
	private _canvas!: HTMLCanvasElement;
	private _ctx!: CanvasRenderingContext2D;

	private _resizeObserver: ResizeObserver = new ResizeObserver((e) => {
		const size = e[0].devicePixelContentBoxSize[0];
		this._canvas.width = size.inlineSize;
		this._canvas.height = size.blockSize;
		this.render();
	});

	public get window() {
		return this._win;
	}

	private _drawVerticalStackedBars(opts: DrawVerticalStackedBarsOpts): void {
		const { canvas, ctx, data, subtasksOrder, subtaskColors, label, startY, chartHeight, labelFont } = opts;
		const count = data.length;
		const availableWidth = canvas.width;
		const barWidth = availableWidth > 0 ? Math.floor(availableWidth / count) : 0;

		// Compute maximum total duration for scaling Y-axis
		const totals = data.map((e) => subtasksOrder.reduce((s, k) => s + (e[k] || 0), 0));
		const maxTotal = Math.ceil(Math.max(...totals, 1) / 10) * 10;
		const scaleY = chartHeight / maxTotal;

		// Draw label
		ctx.font = labelFont;
		ctx.textBaseline = "top";
		ctx.fillStyle = "white";
		ctx.fillText(label, 0, startY);

		const labelHeight = parseInt(ctx.font, 10);
		const chartY = startY + labelHeight + 4;

		// Draw bars
		data.forEach((entry, i) => {
			const x = i * barWidth;
			let accumulatedPx = 0;

			subtasksOrder.forEach((key) => {
				const value = entry[key] || 0;
				const h = value * scaleY;
				if (h > 0) {
					ctx.fillStyle = subtaskColors[key] ?? "#ccc";
					ctx.fillRect(x, chartY + chartHeight - accumulatedPx - h, barWidth, h);
				}
				accumulatedPx += h;
			});
		});

		// Draw horizontal grid lines at each 10-unit step
		ctx.strokeStyle = "rgb(0 0 0 / 20%)"; // grid color
		ctx.lineWidth = 1;
		for (let value = 0; value <= maxTotal; value++) {
			const y = chartY + chartHeight - value * scaleY + 0.5; // center to avoid blur :contentReference[oaicite:1]{index=1}
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}
	}

	public render() {
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

		const chartHeight = 200;
		let h = 10;
		for (const v of this._kayo.project.viewportPanes) {
			this._drawVerticalStackedBars({
				canvas: this._canvas,
				ctx: this._ctx,
				data: v.timeRingeCach,
				subtasksOrder: ["JavaScript", "Render", "indexResolve", "Selection", "Overlays", "compositingTime"],
				subtaskColors: {
					JavaScript: "red",
					Render: "orange",
					indexResolve: "yellow",
					Selection: "green",
					Overlays: "blue",
					compositingTime: "purple",
				},
				label: "Frame Time Distribution",
				startY: h,
				chartHeight,
				labelFont: "24px sans-serif",
			});
			h += chartHeight + 50;
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
		const p = super.createUIElement(win, kayo, performancePaneTemplate) as PerformancePane;
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

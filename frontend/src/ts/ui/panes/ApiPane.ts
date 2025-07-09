import { Kayo } from "../../Kayo";
import { objectToUl } from "../UIUtils";
import BasicPane from "./BasicPane";
import ressourcePaneTemplate from "./RessourcePaneTemplate.json";

function groupBy(array: any[], key: string) {
	return array.reduce((accumulator, value) => {
		const group = value[key];
		if (accumulator[group] === undefined) accumulator[group] = [];
		accumulator[group].push(value);
		return accumulator;
	}, {});
}

export default class APIPane extends BasicPane {
	private tree: HTMLElement | null = null;
	private _win!: Window;

	private buildCallback = async () => {
		if (this.tree && this.contains(this.tree)) this.removeChild(this.tree);
		const gpux = this.kayo.gpux;
		const gpu = gpux.gpu;
		const gpuAdapter = gpux.gpuAdapter;
		const gpuDevice = gpux.gpuDevice;
		const audioContext = this.kayo.audioContext;

		const stream = await navigator.mediaDevices.getUserMedia({
			audio: true,
			video: true,
		});
		stream.getTracks().forEach((track) => track.stop());
		const outputs = await navigator.mediaDevices.enumerateDevices();
		const groupedDevices: { [key: string]: any[] } = groupBy(outputs, "kind");
		for (const key in groupedDevices) {
			groupedDevices[key] = groupedDevices[key].map((dev) => dev.label);
		}

		const obj = {
			Screen: {
				"Available Width": `${this._win.screen.availWidth} pt`,
				"Available Height": `${this._win.screen.availHeight} pt`,
				Width: `${this._win.screen.width} pt`,
				Height: `${this._win.screen.height} pt`,
				Orientation: this._win.screen.orientation,
				"Color Depth": this._win.screen.colorDepth,
				"Pixel Depth": this._win.screen.pixelDepth,
				"Device Pixel Ratio": this._win.devicePixelRatio,
				"Conclude HDR Support": this._win.screen.colorDepth > 24,
			},
			GPU: {
				"Prefered Canvas Format": gpu.getPreferredCanvasFormat(),
				"WGLS Features": Array.from(gpu.wgslLanguageFeatures),
			},
			"GPU Adapter": {
				Info: gpuAdapter.info,
				Features: Array.from(gpuAdapter.features),
				Limits: gpuAdapter.limits,
			},
			"GPU Device": {
				Label: gpuDevice.label,
				Features: Array.from(gpuDevice.features),
				Limits: gpuDevice.limits,
			},
			Audio: {
				State: `${audioContext.state}`,
				"Sample Rate": `${audioContext.sampleRate} Hz`,
				"Base Latency": `${audioContext.baseLatency * 1000}ms`,
				"Output Latency": `${audioContext.outputLatency * 1000}ms`,
				Destination: {
					"Max Channel Count": audioContext.destination.maxChannelCount,
					"Channel Count": audioContext.destination.channelCount,
					"Channel Count mode": audioContext.destination.channelCountMode,
				},
			},
			Outputs: groupedDevices,
		};
		this.tree = objectToUl(this._win, obj);
		this.appendChild(this.tree);
	};

	public static createUIElement(win: Window, kayo: Kayo): APIPane {
		const p = super.createUIElement(win, kayo, ressourcePaneTemplate) as APIPane;
		p._win = win;
		return p;
	}

	public static getDomClass(): string {
		return "api-pane";
	}

	public static getName() {
		return "Web API";
	}

	connectedCallback() {
		this.buildCallback();
		this._win.addEventListener("resize", this.buildCallback);
	}

	disconnectedCallback() {
		this._win.removeEventListener("resize", this.buildCallback);
	}
}

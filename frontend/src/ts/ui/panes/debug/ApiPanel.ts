import { Kayo } from "../../../Kayo";
import { objectToUl } from "../../UIUtils";

function groupBy(array: any[], key: string) {
	const reduceCallback = (accumulator: any, value: any) => {
		const group = value[key];
		if (accumulator[group] === undefined) accumulator[group] = [];
		accumulator[group].push(value);
		return accumulator;
	};
	return array.reduce(reduceCallback, {});
}

async function checkPermissions() {
	// eslint-disable-next-line local/no-await
	const camera = await navigator.permissions.query({ name: "camera" });
	// eslint-disable-next-line local/no-await
	const microphone = await navigator.permissions.query({ name: "microphone" });
	return camera.state == "granted" && microphone.state == "granted";
}

export default class APIPanel extends HTMLElement {
	private _kayo!: Kayo;
	private _tree: HTMLElement | null = null;
	private _win!: Window;

	private buildCallback = async () => {
		if (this._tree && this.contains(this._tree)) this.removeChild(this._tree);
		const gpux = this._kayo.gpux;
		const gpu = gpux.gpu;
		const gpuAdapter = gpux.gpuAdapter;
		const gpuDevice = gpux.gpuDevice;
		const audioContext = this._kayo.audioContext;

		// eslint-disable-next-line local/no-await
		if (!(await checkPermissions())) {
			// eslint-disable-next-line local/no-await
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: true,
			});
			for (const track of stream.getTracks()) track.stop();
		}
		// eslint-disable-next-line local/no-await
		const outputs = await navigator.mediaDevices.enumerateDevices();
		const groupedDevices: { [key: string]: any[] } = groupBy(outputs, "kind");
		for (const key in groupedDevices) {
			const mapping = (dev: any) => dev.label;
			groupedDevices[key] = groupedDevices[key].map(mapping);
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
			Threads: {
				concurrency: navigator.hardwareConcurrency,
			},
			WASM: {
				memory: this._kayo.wasmx.heap.byteLength,
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
		this._tree = objectToUl(this._win, obj);
		this.appendChild(this._tree);
	};

	protected connectedCallback() {
		this.buildCallback();
		this._win.addEventListener("resize", this.buildCallback);
	}

	protected disconnectedCallback() {
		this._win.removeEventListener("resize", this.buildCallback);
	}

	public static createUIElement(win: Window, kayo: Kayo): APIPanel {
		const p = win.document.createElement(this.getDomClass()) as APIPanel;
		p._kayo = kayo;
		p._win = win;
		return p;
	}

	public static getDomClass(): string {
		return "api-panel";
	}

	public static getName() {
		return "Web API";
	}
}

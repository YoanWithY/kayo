import { PageContext } from "../../PageContext";
import { objectToUl } from "../UIUtils";
import BasicPane from "./BasicPane";
import ressourcePaneTemplate from "./RessourcePaneTemplate.json"
export default class RessourcePane extends BasicPane {
	private tree: HTMLElement | null = null;
	private _win!: Window;

	private buildCallback = () => {
		if (this.tree)
			this.removeChild(this.tree);
		const gpux = this.pageContext.project.gpux;
		const gpu = gpux.gpu;
		const gpuAdapter = gpux.gpuAdapter;
		const gpuDevice = gpux.gpuDevice;
		const obj = {
			"Screen": {
				"Available Width": `${this._win.screen.availWidth} pt`,
				"Available Height": `${this._win.screen.availHeight} pt`,
				"Width": `${this._win.screen.width} pt`,
				"Height": `${this._win.screen.height} pt`,
				"Orientation": this._win.screen.orientation,
				"Color Depth": this._win.screen.colorDepth,
				"Pixel Depth": this._win.screen.pixelDepth,
				"Device Pixel Ratio": this._win.devicePixelRatio,
				"Conclude HDR Support": this._win.screen.colorDepth > 24
			},
			"GPU": {
				"Prefered Canvas Format": gpu.getPreferredCanvasFormat(),
				"WGLS Features": Array.from(gpu.wgslLanguageFeatures),
			},
			"GPU Adapter": {
				"Is Fallback Adapter": gpuAdapter.isFallbackAdapter,
				"Info": gpuAdapter.info,
				"Features": Array.from(gpuAdapter.features),
				"Limits": gpuAdapter.limits,
			},
			"GPU Device": {
				"Label": gpuDevice.label,
				"Features": Array.from(gpuDevice.features),
				"Limits": gpuDevice.limits,
			}
		}
		this.tree = objectToUl(this._win, obj);
		this.appendChild(this.tree);
	}

	public static createUIElement(win: Window, pageContext: PageContext): RessourcePane {
		const p = super.createUIElement(win, pageContext, ressourcePaneTemplate) as RessourcePane;
		p._win = win;
		return p;
	}

	public static getDomClass(): string {
		return "ressource-pane";
	}

	public static getName() {
		return "Ressources"
	}

	connectedCallback() {
		this.buildCallback();
		this._win.addEventListener("resize", this.buildCallback)
	}

	disconnectedCallback() {
		this._win.removeEventListener("resize", this.buildCallback);
	}
}
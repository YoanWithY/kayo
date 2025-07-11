import RealtimeRenderer from "../rendering/RealtimeRenderer";
import Scene from "./Scene";
import { WrappingPane } from "../ui/Wrapping/WrappingPane";
import { GPUX } from "../GPUX";
import Background from "../lights/Background";
import TextureUtils from "../Textures/TextureUtils";
import { Kayo } from "../Kayo";
import { PTPBase } from "../collaborative/PTPBase";
import WASMX from "../WASMX";

export class Project {
	kayo: Kayo;
	gpux: GPUX;
	wasmx: WASMX;
	renderer!: RealtimeRenderer;
	scene!: Scene;
	ptpBase: PTPBase;

	constructor(kayo: Kayo) {
		this.kayo = kayo;
		this.gpux = kayo.gpux;
		this.wasmx = kayo.wasmx;
		this.renderer = new RealtimeRenderer(this);
		this.renderer.init();
		this.ptpBase = new PTPBase(this);

		TextureUtils.init(this.gpux.gpuDevice);
		Background.init(this.gpux.gpuDevice, this.renderer.bindGroup0Layout);

		this.scene = new Scene();
		this.scene.background = new Background(this);
	}

	requestUI(win: Window, defaultPane: string, useHeader: boolean) {
		win.document.body.appendChild(WrappingPane.createWrappingPane(win, this.kayo, defaultPane, useHeader));
	}

	fullRerender() {
		for (const vp of this.renderer.viewportPanes) this.renderer.requestAnimationFrameWith(vp);
	}
}

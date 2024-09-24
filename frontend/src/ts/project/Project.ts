import { ProjectConfig } from "./Config";
import { ProjectState } from "./State";
import Renderer from "../rendering/Renderer";
import Scene from "./Scene";
import { WrappingPane } from "../ui/Wrapping/WrappingPane";
import { ViewportPane } from "../ui/panes/ViewportPane";
import { gpu } from "../GPUX";
import { GridPipeline } from "../debug/GridPipeline";
import HeightFieldR3 from "../dynamicObject/heightField/HeightFieldR3";
export class Project {

	config: ProjectConfig;
	state: ProjectState;
	renderer!: Renderer;
	scene!: Scene;
	uiRoot!: WrappingPane;

	constructor() {
		this.config = new ProjectConfig();
		this.state = new ProjectState(this, this.config);
		this.renderer = new Renderer(this);
		this.renderer.init();
		this.scene = new Scene();
		this.uiRoot = WrappingPane.createWrappingPane(this);
		document.body.appendChild(this.uiRoot);


		const arr = [[1, 0], [1, 1], [0, 1]];
		for (let i = 0; i < 18; i++) {
			const scale = Math.pow(2, i);
			for (const a of arr) {
				const h = new HeightFieldR3(
					this,
					`return sin(arg.x / 1000.0) * sin(arg.y / 1000.0) * 500.0 + 
					sin(arg.x / 25.0) * sin(arg.y / 25.0) * 25.0 + 
					sin(arg.x / 5.0 + f32(view.frame.x) / 10.0) * sin(arg.y / 5.0) * 5.0 +
					sin(arg.x) * sin(arg.y);`,
					100,
					100,
					a[0] * scale,
					a[1] * scale,
					scale,
					scale,
					a[0] * scale,
					a[1] * scale,
					scale,
					scale);
				this.scene.heightFieldObjects.add(h);
			}
		}

		this.scene.gridPipeline = new GridPipeline(this);
	}

	fullRerender() {
		for (const vp of ViewportPane.viewportPanes)
			this.renderer.requestAnimationFrameWith(vp);
	}

	getTargetColorspaceConstants(): Record<string, number> {
		return {
			targetColorSpace: this.config.output.display.swapChainColorSpace == "srgb" ? 0 : 1,
		};
	}

	getDisplayFragmentOutputConstants(): Record<string, number> {
		return {
			targetColorSpace: this.config.output.display.swapChainColorSpace == "srgb" ? 0 : 1,
			componentTranfere: this.config.output.render.mode === "deferred" ? 0 : 1,
		};
	}

	getSwapChainFormat(): GPUTextureFormat {
		if (this.config.output.display.swapChainBitDepth === "8bpc")
			return gpu.getPreferredCanvasFormat();
		return "rgba16float";
	}

	getFragmentTargets(): GPUColorTargetState[] {
		return [
			{ format: this.getSwapChainFormat() },
			{ format: "r16uint" }
		];
	}
}
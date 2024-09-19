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

		this.scene.heightFieldObjects.add(new HeightFieldR3(this));

		const h2 = new HeightFieldR3(this);
		h2.transformationStack.rotate.setValues(0.5, 0.5, 0.5);
		h2.isSelected = true;
		this.scene.heightFieldObjects.add(h2);

		const h3 = new HeightFieldR3(this);
		h3.transformationStack.rotate.setValues(1.5, 1.5, 1.5);
		this.scene.heightFieldObjects.add(h3);
		h3.isActive = true;

		this.scene.gridPipeline = new GridPipeline(this);
	}

	fullRerender() {
		for (const vp of ViewportPane.viewportPanes)
			this.renderer.requestAnimationFrameWith(vp);
	}

	getDisplayFragmentOutputConstantsCopy(): Record<string, number> {
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
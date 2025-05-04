import { ProjectConfig } from "./Config";
import { ProjectState } from "./State";
import Renderer from "../rendering/Renderer";
import Scene from "./Scene";
import { WrappingPane } from "../ui/Wrapping/WrappingPane";
import { GPUX } from "../GPUX";
import { GridPipeline } from "../debug/GridPipeline";
import HeightFieldR3 from "../dynamicObject/heightField/HeightFieldR3";
import { SunLight } from "../lights/SunLight";
import { MinecraftOpaquePipeline } from "../minecraft/MinecraftOpaquePipeline";
import Background from "../lights/Background";
import { HeightFieldPipeline } from "../dynamicObject/heightField/HeightFieldPipeline";
import TextureUtils from "../Textures/TextureUtils";
import { PageContext } from "../PageContext";
import StateVariable from "./StateVariable";
import { PTPBase } from "../collaborative/PTPBase";

export class Project {
	pageContext: PageContext;
	gpux: GPUX;
	config: ProjectConfig;
	state: ProjectState;
	renderer!: Renderer;
	scene!: Scene;
	ptpBase: PTPBase;

	constructor(pageContext: PageContext) {
		this.pageContext = pageContext;
		this.gpux = pageContext.gpux;
		this.config = new ProjectConfig();
		this.state = new ProjectState(this, this.config);
		this.renderer = new Renderer(this);
		this.renderer.init();
		this.ptpBase = new PTPBase(this);

		TextureUtils.init(this.gpux.gpuDevice);
		SunLight.init(this);
		HeightFieldPipeline.init(this);
		HeightFieldR3.init(this);
		MinecraftOpaquePipeline.init(this);
		Background.initBuffers(this.gpux.gpuDevice);

		this.scene = new Scene();
		this.scene.background = new Background(this);

		const arr = [
			[1, 0],
			[1, 1],
			[0, 1],
		];
		for (let i = 0; i < 0; i++) {
			const scale = Math.pow(2, i);
			for (const a of arr) {
				const h = new HeightFieldR3(
					this,
					`
					let a = arg;
					let t = f32(view.frame[0]) / 100.0;
					
					return sin(a.x / 1000.0) * sin(a.y / 1000.0) * 500.0 + 
					sin(a.x / 25.0 + t) * sin(a.y / 25.0 + t) * 25.0 + 
					sin(a.x / 5.0) * sin(a.y / 5.0) * 5.0;`,
					100,
					100,
					a[0] * scale,
					a[1] * scale,
					scale,
					scale,
					a[0] * scale,
					a[1] * scale,
					scale,
					scale,
				);
				this.scene.heightFieldObjects.add(h);
			}
		}

		const s = new SunLight(this);
		s.transformationStack.translate.setValues(500, 0, 500);
		s.transformationStack.rotate.setValues(1, 0, 1);
		this.scene.sunlights.add(s);
		this.scene.gridPipeline = new GridPipeline(this);
	}

	requestUI(win: Window) {
		win.document.body.appendChild(WrappingPane.createWrappingPane(win, this.pageContext));
	}

	getVariableFromURL(stateVariableURL: string): StateVariable<any> | undefined {
		const names = stateVariableURL.split(".");
		let obj: any = this[names[0] as keyof Project];
		for (let i = 1; i < names.length && obj !== undefined; i++) obj = obj[names[i]];
		return obj;
	}

	fullRerender() {
		for (const vp of this.renderer.viewportPanes) this.renderer.requestAnimationFrameWith(vp);
	}

	getTargetColorspaceConstants(): Record<string, number> {
		return {
			targetColorSpace: this.config.output.display.swapChainColorSpace == "srgb" ? 0 : 1,
		};
	}

	getDisplayFragmentOutputConstants(): { targetColorSpace: number; componentTranfere: number } {
		return {
			targetColorSpace: this.config.output.display.swapChainColorSpace == "srgb" ? 0 : 1,
			componentTranfere: this.config.output.render.mode === "deferred" ? 0 : 1,
		};
	}

	getSwapChainFormat(): GPUTextureFormat {
		if (this.config.output.display.swapChainBitDepth === "8bpc") return this.gpux.gpu.getPreferredCanvasFormat();
		return "rgba16float";
	}

	getFragmentTargets(): GPUColorTargetState[] {
		return [{ format: this.getSwapChainFormat() }, { format: "r16uint" }];
	}
}

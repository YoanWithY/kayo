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
import { Kayo } from "../Kayo";
import { PTPBase } from "../collaborative/PTPBase";
import WASMX from "../WASMX";

export class Project {
	kayo: Kayo;
	gpux: GPUX;
	wasmx: WASMX;
	renderer!: Renderer;
	scene!: Scene;
	ptpBase: PTPBase;

	constructor(kayo: Kayo) {
		this.kayo = kayo;
		this.gpux = kayo.gpux;
		this.wasmx = kayo.wasmx;
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
		for (let i = 0; i < 8; i++) {
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
		win.document.body.appendChild(WrappingPane.createWrappingPane(win, this.kayo));
	}

	getStateIDFromURL(stateVariableURL: string): number | undefined {
		const names = stateVariableURL.split(".");
		let obj: any = this.kayo.wasmx.kayoInstance.project;
		for (let i = 0; i < names.length && obj !== undefined; i++) obj = obj[names[i]];
		console.log(stateVariableURL);
		return obj.getObservationID();
	}

	fullRerender() {
		for (const vp of this.renderer.viewportPanes) this.renderer.requestAnimationFrameWith(vp);
	}

	getTargetColorspaceConstants(): Record<string, number> {
		return {
			targetColorSpace: this.wasmx.kayoInstance.project.output.swapChain.colorSpace.getValue() == "srgb" ? 0 : 1,
		};
	}

	getDisplayFragmentOutputConstants(): { targetColorSpace: number; componentTranfere: number } {
		return {
			targetColorSpace: this.wasmx.kayoInstance.project.output.swapChain.colorSpace.getValue() == "srgb" ? 0 : 1,
			componentTranfere: 1,
		};
	}

	getSwapChainFormat(): GPUTextureFormat {
		const v = this.wasmx.kayoInstance.projectConfig.output.swapChain.bitDepth;
		if (v === 8) return this.gpux.gpu.getPreferredCanvasFormat();
		return "rgba16float";
	}

	getFragmentTargets(): GPUColorTargetState[] {
		return [{ format: this.getSwapChainFormat() }, { format: "r16uint" }];
	}
}

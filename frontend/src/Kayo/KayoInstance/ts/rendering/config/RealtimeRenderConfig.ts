import { EnumFCurve } from "../../../c/KayoCorePP";
import { KayoEnum } from "../../KayoEnum";
import { KayoInstance } from "../../KayoInstance";
import { SpecificRenderConfig } from "./RenderConfig";

export class RealtimeAntialiasingRenderConfig {
	private _msaa: EnumFCurve;
	private _msaaEnum: KayoEnum<number>

	private _interpolation: EnumFCurve;
	private _interpolationEnum: KayoEnum<string>;

	public constructor(kayo: KayoInstance) {
		this._msaa = new kayo.wasmx.wasm.EnumFCurve(kayo.project.allocID(), 0, 1);
		this._msaaEnum = new KayoEnum([{ key: 1, text: "1" }, { key: 4, text: "4" }]);

		this._interpolation = new kayo.wasmx.wasm.EnumFCurve(kayo.project.allocID(), 0, 2);
		this._interpolationEnum = new KayoEnum([{ key: "center", text: "Center" }, { key: "centroid", text: "Centroid" }, { key: "sample", text: "Sample" }]);
	}

	public get msaaEnum() {
		return this._msaaEnum;
	}

	public get interpolationEnum() {
		return this._interpolationEnum;
	}

	public get msaa() {
		return this._msaa;
	}

	public get interpolation() {
		return this._interpolation;
	}


	public destroy() {

	}
}

export class RealtimeSpecificRenderConfig extends SpecificRenderConfig {
	private _antialiasing: RealtimeAntialiasingRenderConfig;

	public constructor(kayo: KayoInstance) {
		super();
		this._antialiasing = new RealtimeAntialiasingRenderConfig(kayo);
	}

	public get antialiasing() {
		return this._antialiasing;
	}

	public destroy(): void {
		this._antialiasing.destroy();
	}
}

export type RealtimeConfigObject = { colorSpace: string, useCustomColorQuantization: boolean, useDithering: boolean, bitDepth: 8 | 16, msaa: 1 | 4, toneMappingMode: string };

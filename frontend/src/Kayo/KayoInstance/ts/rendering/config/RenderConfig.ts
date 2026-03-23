import { BooleanFCurve, EnumFCurve } from "../../../c/KayoCorePP";
import { KayoEnum } from "../../KayoEnum";
import { KayoInstance } from "../../KayoInstance";

export class SwapChainRenderConfig {
	private _bitDepth: EnumFCurve;
	private _bitDepthEnum: KayoEnum<number>;

	private _colorSpace: EnumFCurve;
	private _colorSpaceEnum: KayoEnum<string>;

	private _toneMappingMode: EnumFCurve;
	private _toneMappingModeEnum: KayoEnum<string>;

	public constructor(kayo: KayoInstance) {
		this._bitDepth = new kayo.wasmx.wasm.EnumFCurve(kayo.project.allocID(), 0, 1);
		this._bitDepthEnum = new KayoEnum([{ key: 8, text: "8 BPC" }, { key: 16, text: "16 BPC" }]);

		this._colorSpace = new kayo.wasmx.wasm.EnumFCurve(kayo.project.allocID(), 0, 1);
		this._colorSpaceEnum = new KayoEnum([{ key: "srgb", text: "sRGB" }, { key: "display-p3", text: "Display P3" }]);

		this._toneMappingMode = new kayo.wasmx.wasm.EnumFCurve(kayo.project.allocID(), 0, 1);
		this._toneMappingModeEnum = new KayoEnum([{ key: "standard", text: "Standard" }, { key: "extended", text: "Extended" }]);
	}

	public get bitDepthEnum() {
		return this._bitDepthEnum;
	}
	public get colorSpaceEnum() {
		return this._colorSpaceEnum;
	}
	public get toneMappingModeEnum() {
		return this._toneMappingModeEnum;
	}
	public get bitDepth() {
		return this._bitDepth;
	}
	public get colorSpace() {
		return this._colorSpace;
	}
	public get toneMappingMode() {
		return this._toneMappingMode;
	}
	public destroy() {
		this._bitDepth.delete();
	}
}

export class CustomColorQuantisationRenderConfig {
	private _useCustomColorQuantisation: BooleanFCurve;
	private _useDithering: BooleanFCurve;

	public constructor(kayo: KayoInstance) {
		this._useCustomColorQuantisation = new kayo.wasmx.wasm.BooleanFCurve(kayo.project.allocID(), true);
		this._useDithering = new kayo.wasmx.wasm.BooleanFCurve(kayo.project.allocID(), true);
	}

	public get useCustomColorQuantization() {
		return this._useCustomColorQuantisation;
	}

	public get useDithering() {
		return this._useDithering;
	}

	public destroy() {
		this._useCustomColorQuantisation.delete();
		this._useDithering.delete();
	}
}

export class GeneralRenderConfig {
	private _swapChain: SwapChainRenderConfig;
	private _customColorQuantisation: CustomColorQuantisationRenderConfig;

	public constructor(kayo: KayoInstance) {
		this._swapChain = new SwapChainRenderConfig(kayo);
		this._customColorQuantisation = new CustomColorQuantisationRenderConfig(kayo);
	}

	public get swapChain() {
		return this._swapChain;
	}

	public get customColorQuantisation() {
		return this._customColorQuantisation;
	}

	public destroy() {
		this.swapChain.destroy();
		this.customColorQuantisation.destroy();
	}
}

export abstract class SpecificRenderConfig {
	public abstract destroy(): void;
}

export class RenderConfig {
	private _configKey: string;
	private _general: GeneralRenderConfig;
	private _specific: SpecificRenderConfig;

	public constructor(kayo: KayoInstance, configName: string, specific: SpecificRenderConfig) {
		this._general = new GeneralRenderConfig(kayo);
		this._configKey = configName;
		this._specific = specific;
	}

	public destroy() {
		this._general.destroy();
		this._specific.destroy();
	}

	public get configKey() {
		return this._configKey;
	}

	public get general() {
		return this._general;
	}

	public get specific() {
		return this._specific;
	}
}

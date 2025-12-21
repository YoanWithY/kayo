import { allocPubID, dispatchValue } from "../../PubSub";

export class SwapChainRenderConfig {
	private _bitDepth: 8 | 16 = 8;
	private _colorSpace: PredefinedColorSpace = "srgb";
	private _toneMappingMode: GPUCanvasToneMappingMode = "standard";

	private _bitDepth_pubID = allocPubID();
	private _colorSpace_pubID = allocPubID();
	private _toneMappingMode_pubID = allocPubID();

	public get bitDepth() {
		return this._bitDepth;
	}
	public set bitDepth(v: 8 | 16) {
		this._bitDepth = v;
		dispatchValue(this._bitDepth_pubID, this._bitDepth);
	}
	public get colorSpace() {
		return this._colorSpace;
	}
	public set colorSpace(v: PredefinedColorSpace) {
		this._colorSpace = v;
		dispatchValue(this._colorSpace_pubID, this._colorSpace);
	}
	public get toneMappingMode() {
		return this._toneMappingMode;
	}
	public set toneMappingMode(v: GPUCanvasToneMappingMode) {
		this._toneMappingMode = v;
		dispatchValue(this._toneMappingMode_pubID, this._toneMappingMode);
	}
	public get bitDepth_pubID() {
		return this._bitDepth_pubID;
	}
	public get colorSpace_pubID() {
		return this._colorSpace_pubID;
	}
	public get toneMappingMode_pubID() {
		return this._toneMappingMode_pubID;
	}
}

export class CustomColorQuantisationRenderConfig {
	private _useCustomColorQuantisation: boolean = true;
	private _useDithering = true;

	private _useCustomColorQuantisation_pubID = allocPubID();
	private _useDithering_pubID = allocPubID();

	public get useCustomColorQuantisation() {
		return this._useCustomColorQuantisation;
	}
	public set useCustomColorQuantisation(v: boolean) {
		this._useCustomColorQuantisation = v;
		dispatchValue(this._useCustomColorQuantisation_pubID, this._useCustomColorQuantisation);
	}
	public get useDithering() {
		return this._useDithering;
	}
	public set useDithering(v: boolean) {
		this._useDithering = v;
		dispatchValue(this._useDithering_pubID, this._useDithering);
	}
	public get useCustomColorQuantisation_pubID() {
		return this._useCustomColorQuantisation_pubID;
	}
	public get useDithering_pubID() {
		return this._useDithering_pubID;
	}
}

export class GeneralRenderConfig {
	private _swapChain = new SwapChainRenderConfig();
	private _customColorQuantisation = new CustomColorQuantisationRenderConfig();

	public get swapChain() {
		return this._swapChain;
	}

	public get customColorQuantisation() {
		return this._customColorQuantisation;
	}
}

export abstract class SpecificRenderConfig {
	/**
	 * The unique name of the renderer this specfic config is for.
	 */
	public abstract get rendererName(): string;
}

export class RenderConfig {
	private _name: string;
	private _general = new GeneralRenderConfig();
	private _specific: SpecificRenderConfig;

	public constructor(configName: string, specific: SpecificRenderConfig) {
		this._name = configName;
		this._specific = specific;
	}

	public get name() {
		return this._name;
	}

	public get general() {
		return this._general;
	}

	public get specific() {
		return this._specific;
	}
}

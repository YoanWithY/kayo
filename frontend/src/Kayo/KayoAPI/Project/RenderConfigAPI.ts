import { KayoNumber } from "../../KayoInstance/c/KayoCorePP";
import { RenderConfig } from "../../KayoInstance/ts/rendering/config/RenderConfig";
import { KayoAPI } from "../KayoAPI";
import { AnimatableBooleanAPIValue, AnimatableEnumAPIValue } from "../Utils/APIValue";
import { ValueSetter } from "../Utils/ValueConsumer";

export class SwapChainRenderConfigAPI {
    private _kayoAPI: KayoAPI;
    private _bitDepth: AnimatableEnumAPIValue<number>;
    private _colorSpace: AnimatableEnumAPIValue<string>;
    private _toneMappingMode: AnimatableEnumAPIValue<string>;

    public constructor(kayoAPI: KayoAPI, renderConfig: RenderConfig) {
        this._kayoAPI = kayoAPI;

        this._bitDepth = new AnimatableEnumAPIValue(kayoAPI, renderConfig.general.swapChain.bitDepth, renderConfig.general.swapChain.bitDepthEnum);
        this._colorSpace = new AnimatableEnumAPIValue(kayoAPI, renderConfig.general.swapChain.colorSpace, renderConfig.general.swapChain.colorSpaceEnum);
        this._toneMappingMode = new AnimatableEnumAPIValue(kayoAPI, renderConfig.general.swapChain.toneMappingMode, renderConfig.general.swapChain.toneMappingModeEnum);
    }

    public set bitDepth(bitDepth: number | KayoNumber) {
        ValueSetter.numberEnum(this._kayoAPI, bitDepth, this._bitDepth);
    }

    public get bitDepth() {
        return this._bitDepth.getValue();
    }

    public set colorSpace(colorSpace: string | KayoNumber) {
        ValueSetter.stringEnum(this._kayoAPI, colorSpace, this._colorSpace);
    }

    public get colorSpace() {
        return this._colorSpace.getValue();
    }

    public set toneMappingMode(toneMappingMode: string | KayoNumber) {
        ValueSetter.stringEnum(this._kayoAPI, toneMappingMode, this._toneMappingMode);
    }

    public get toneMappingMode() {
        return this._toneMappingMode.getValue();
    }
}

export class CustomColorQuantizationRenderConfigAPI {
    private _kayoAPI: KayoAPI;
    private _useCustomColorQunatization: AnimatableBooleanAPIValue;
    private _useDithering: AnimatableBooleanAPIValue;

    public constructor(kayoAPI: KayoAPI, renderConfig: RenderConfig) {
        this._kayoAPI = kayoAPI;
        this._useCustomColorQunatization = new AnimatableBooleanAPIValue(kayoAPI, renderConfig.general.customColorQuantisation.useCustomColorQuantization);
        this._useDithering = new AnimatableBooleanAPIValue(kayoAPI, renderConfig.general.customColorQuantisation.useDithering);
    }

    public set useCustomColorQuantisation(useCustomColorQuantisation: boolean | KayoNumber) {
        ValueSetter.booleanValue(this._kayoAPI, useCustomColorQuantisation, this._useCustomColorQunatization);
    }

    public set useDithering(useDithering: boolean | KayoNumber) {
        ValueSetter.booleanValue(this._kayoAPI, useDithering, this._useDithering);
    }
}

export class GeneralRenderConfigAPI {
    private _renderConfig: RenderConfig;
    private _swapChain: SwapChainRenderConfigAPI;
    private _customColorQuantization: CustomColorQuantizationRenderConfigAPI;

    public constructor(kayoAPI: KayoAPI, renderConfig: RenderConfig) {
        this._renderConfig = renderConfig;
        this._swapChain = new SwapChainRenderConfigAPI(kayoAPI, this._renderConfig);
        this._customColorQuantization = new CustomColorQuantizationRenderConfigAPI(kayoAPI, renderConfig);
    }

    public get swapChain() {
        return this._swapChain;
    }

    public get customColorQuantization() {
        return this._customColorQuantization;
    }
}

export class RenderConfigAPI {
    private _renderConfig: RenderConfig;
    private _generalRenderConfig: GeneralRenderConfigAPI;

    public constructor(kayo: KayoAPI, renderConfig: RenderConfig) {
        this._renderConfig = renderConfig;
        this._generalRenderConfig = new GeneralRenderConfigAPI(kayo, renderConfig);
    }

    public get general() {
        return this._generalRenderConfig;
    }

    public get configKey() {
        return this._renderConfig.configKey;
    }

    public get internal() {
        return this._renderConfig;
    }
}
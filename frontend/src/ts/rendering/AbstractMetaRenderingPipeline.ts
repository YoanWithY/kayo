import { GeneralConfig } from "../../c/KayoCorePP";
import { GPUX } from "../GPUX";
import { AbstractRenderingPipeline } from "./AbstractRenderingPipeline";

export type RenderConfigKey = {
	outputColorSpace: PredefinedColorSpace;
	outputComponentTransfere: "sRGB" | "linear";
	useColorQuantisation: boolean;
	useDithering: boolean;
	msaa: 1 | 4;
	swapChainBitDepth: number;
};

export type KeyValueBuildFunction<T> = (key: RenderConfigKey) => T;
export type PipelineBuildFunction = KeyValueBuildFunction<AbstractRenderingPipeline>;

function objectContainsKey(object: any, key: any): boolean {
	for (const k in key) if (object[k] !== key[k]) return false;
	return true;
}

export class KeyValuedCache<T> {
	protected keyedValueMap: Map<RenderConfigKey, T> = new Map();
	protected _buildFunction!: KeyValueBuildFunction<T>;

	protected getValue(renderConfigKey: RenderConfigKey) {
		for (const [key, val] of this.keyedValueMap) {
			if (objectContainsKey(key, renderConfigKey)) {
				return val;
			}
		}

		const value = this._buildFunction(renderConfigKey);
		this.keyedValueMap.set(renderConfigKey, value);
		return value;
	}

	public set buildFunction(buildFunction: KeyValueBuildFunction<T>) {
		this._buildFunction = buildFunction;
	}

	public clear() {
		this.keyedValueMap.clear();
	}
}

export class PipelineCache extends KeyValuedCache<AbstractRenderingPipeline> {
	public getPipeline(renderKonfigKey: RenderConfigKey) {
		return this.getValue(renderKonfigKey);
	}
}

export class RenderBundleCache extends KeyValuedCache<GPURenderBundle> {
	public getBundle(renderKonfigKey: RenderConfigKey) {
		return this.getValue(renderKonfigKey);
	}
}

/**
 * This class serves as base class for WebGPU rasterization rendererable objects. It purposefully combines pipeline building, cacheing and retriving.
 * This ensures high cohesion of functionality regarding the gpu pipelines for one object.
 */
export abstract class AbstractMetaRenderPipeline {
	protected readonly _id: string;
	protected readonly _renderPiplineCache: PipelineCache;
	// protected readonly _depthPipeline: AbstractRenderingPipeline;
	// protected readonly _selectionPipeline: AbstractRenderingPipeline;

	public constructor(id: string) {
		this._id = id;
		this._renderPiplineCache = new PipelineCache();
		// this._depthPipeline = this._buildDepthPipeline();
		// this._selectionPipeline = this._buildSelectionPipeline();
	}

	protected abstract _buildRenderingPipeline: PipelineBuildFunction;
	protected abstract _buildDepthPipeline(): AbstractRenderingPipeline;
	protected abstract _buildSelectionPipeline(): AbstractRenderingPipeline;

	public getRenderPipeline(renderPiplineKey: RenderConfigKey): AbstractRenderingPipeline {
		return this._renderPiplineCache.getPipeline(renderPiplineKey);
	}

	// public getDepthPipeline(): AbstractRenderingPipeline {
	// 	return this._depthPipeline;
	// }

	// public getSelectionPipeline(): AbstractRenderingPipeline {
	// 	return this._selectionPipeline;
	// }

	public get id(): string {
		return this._id;
	}

	public static getRenderingFragmentTargetsFromKey(key: RenderConfigKey, gpux: GPUX): GPUColorTargetState[] {
		return [{ format: gpux.getSwapChainFormat(key.swapChainBitDepth) }, { format: "r16uint" }];
	}

	public static getColorFormats(renderConfigKey: RenderConfigKey, gpux: GPUX): GPUTextureFormat[] {
		return [gpux.getSwapChainFormat(renderConfigKey.swapChainBitDepth), "r16uint"];
	}

	public static getConstantsFromKey(key: RenderConfigKey): Record<string, number> | undefined {
		return {
			output_color_space: key.outputColorSpace == "srgb" ? 0 : 1,
			use_color_quantisation: key.useColorQuantisation ? 1 : 0,
			use_dithering: key.useDithering ? 1 : 0,
			output_component_transfere: key.outputComponentTransfere == "linear" ? 0 : 1,
		};
	}

	public static configToKey(config: GeneralConfig, msaa: 1 | 4): RenderConfigKey {
		return {
			outputColorSpace: config.swapChain.colorSpace as PredefinedColorSpace,
			outputComponentTransfere: "sRGB",
			useColorQuantisation: config.customColorQuantisation.useCustomColorQuantisation,
			useDithering:
				config.customColorQuantisation.useCustomColorQuantisation &&
				config.customColorQuantisation.useDithering,
			msaa: msaa,
			swapChainBitDepth: config.swapChain.bitDepth,
		};
	}
}

import { GeneralConfig } from "../../c/KayoCorePP";
import { GPUX } from "../GPUX";
import { AbstractRenderingPipeline } from "./AbstractRenderingPipeline";

export type RenderPipelineKey = {
	outputColorSpace: PredefinedColorSpace;
	outputComponentTransfere: "sRGB" | "linear";
	useColorQuantisation: boolean;
	useDithering: boolean;
	msaa: 1 | 4;
	swapChainBitDepth: number;
};

export type PipelineBuildFunction = (key: RenderPipelineKey) => AbstractRenderingPipeline;

function objectContainsKey(object: any, key: any): boolean {
	for (const k in key) if (object[k] !== key[k]) return false;
	return true;
}

export class PipelineCache {
	protected pipelines: Map<RenderPipelineKey, AbstractRenderingPipeline> = new Map();
	protected _buildFunction!: PipelineBuildFunction;

	public getPipeline(renderPiplineKey: RenderPipelineKey) {
		for (const [key, val] of this.pipelines) {
			if (objectContainsKey(key, renderPiplineKey)) {
				return val;
			}
		}

		const newPipeline = this._buildFunction(renderPiplineKey);
		this.pipelines.set(renderPiplineKey, newPipeline);
		return newPipeline;
	}

	public set buildFunction(buildFunction: PipelineBuildFunction) {
		this._buildFunction = buildFunction;
	}

	public clear() {
		this.pipelines.clear();
	}
}

/**
 * This class serves as base class for WebGPU rasterization rendererable objects. It purposefully combines pipeline building, cacheing and retriving.
 * This ensures high cohesion of functionality regarding the gpu pipelines for one object.
 */
export abstract class AbstractMetaRenderPipeline {
	protected readonly _id: string;
	protected readonly _renderPiplines: PipelineCache;
	protected readonly _depthPipeline: AbstractRenderingPipeline;
	protected readonly _selectionPipeline: AbstractRenderingPipeline;

	public constructor(id: string) {
		this._id = id;
		this._renderPiplines = new PipelineCache();
		this._depthPipeline = this._buildDepthPipeline();
		this._selectionPipeline = this._buildSelectionPipeline();
	}

	protected abstract _buildRenderingPipeline: PipelineBuildFunction;
	protected abstract _buildDepthPipeline(): AbstractRenderingPipeline;
	protected abstract _buildSelectionPipeline(): AbstractRenderingPipeline;

	public getRenderPipeline(renderPiplineKey: RenderPipelineKey): AbstractRenderingPipeline {
		return this._renderPiplines.getPipeline(renderPiplineKey);
	}

	public getDepthPipeline(): AbstractRenderingPipeline {
		return this._depthPipeline;
	}

	public getSelectionPipeline(): AbstractRenderingPipeline {
		return this._selectionPipeline;
	}

	public get id(): string {
		return this._id;
	}

	public static getRenderingFragmentTargetsFromKey(key: RenderPipelineKey, gpux: GPUX): GPUColorTargetState[] {
		return [{ format: gpux.getSwapChainFormat(key.swapChainBitDepth) }, { format: "r16uint" }];
	}

	public static getConstantsFromKey(key: RenderPipelineKey): Record<string, number> | undefined {
		return {
			output_color_space: key.outputColorSpace == "srgb" ? 0 : 1,
			use_color_quantisation: key.useColorQuantisation ? 1 : 0,
			use_dithering: key.useDithering ? 1 : 0,
			output_component_transfere: key.outputComponentTransfere == "linear" ? 0 : 1,
		};
	}

	public static configToKey(config: GeneralConfig, msaa: 1 | 4): RenderPipelineKey {
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

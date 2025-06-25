import { GeneralConfig } from "../../c/KayoCorePP";
import { GPUX } from "../GPUX";
import { AbstractRenderingPipeline } from "./AbstractRenderingPipeline";

export type RenderPipelineKey = {
	outputColorSpace: PredefinedColorSpace;
	msaa: number;
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

	constructor(id: string) {
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
			outputColorSpace: key.outputColorSpace == "srgb" ? 0 : 1,
		};
	}

	public static generalConfigToKey(config: GeneralConfig, msaa: number = 1): RenderPipelineKey {
		return {
			outputColorSpace: config.swapChain.colorSpace as PredefinedColorSpace,
			msaa: msaa,
			swapChainBitDepth: config.swapChain.bitDepth,
		};
	}
}

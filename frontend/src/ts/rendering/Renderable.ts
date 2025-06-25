import { RenderPipelineKey } from "./AbstractMetaRenderingPipeline";

export default interface Renderable {
	recordForwardRendering: (renderPassEncoder: GPURenderPassEncoder, key: RenderPipelineKey) => void;
}

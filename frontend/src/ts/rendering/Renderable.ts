import { RenderConfigKey } from "./AbstractMetaRenderingPipeline";

export default interface Renderable {
	recordForwardRendering: (renderPassEncoder: GPURenderPassEncoder, key: RenderConfigKey) => void;
}

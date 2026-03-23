import { RealtimeConfigObject } from "./config/RealtimeRenderConfig";

export interface RealtimeRenderableRepresentation {
	get representationType(): string;
	recordForwardRendering: (renderPassEncoder: GPURenderPassEncoder) => void;
	update(config: RealtimeConfigObject): void;
}

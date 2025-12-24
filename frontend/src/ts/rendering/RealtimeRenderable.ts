export default interface RealtimeRenderable {
	recordForwardRendering: (renderPassEncoder: GPURenderPassEncoder) => void;
}

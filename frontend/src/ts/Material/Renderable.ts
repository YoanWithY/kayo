export default interface Renderable {
	recordForwardRendering: (renderPassEncoder: GPURenderPassEncoder) => void;
}
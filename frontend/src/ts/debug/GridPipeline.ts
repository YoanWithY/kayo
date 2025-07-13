import Renderable from "../rendering/Renderable";
import { AbstractRenderingPipeline } from "../rendering/AbstractRenderingPipeline";

export class GridPipeline extends AbstractRenderingPipeline implements Renderable {
	protected primiteState: GPUPrimitiveState;
	protected vertexState: GPUVertexState;
	protected fragmentState: GPUFragmentState;
	protected static pushRotation(arr: number[], outer: number, inner: number) {
		arr.push(
			-outer,
			-outer,
			-inner,
			-inner,
			-outer,
			outer,
			-inner,
			inner,
			outer,
			outer,
			inner,
			inner,
			outer,
			-outer,
			inner,
			-inner,
			-outer,
			-outer,
			-inner,
			-inner,
		);
	}
	public constructor(label: string, shaderModule: GPUShaderModule) {
		super(label, shaderModule);
		this.primiteState = {};
		this.vertexState = {
			module: shaderModule,
		};
		this.fragmentState = {
			module: shaderModule,
			targets: [],
		};
	}

	public recordForwardRendering(_: GPURenderPassEncoder): void {
		// renderPassEncoder.setPipeline(this.gpuPipeline);
		// renderPassEncoder.setVertexBuffer(0, this.vertexBuffer);
		// renderPassEncoder.draw(this.vertices);
	}
}

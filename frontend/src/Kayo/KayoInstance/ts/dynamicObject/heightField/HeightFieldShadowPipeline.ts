import { AbstractRenderingPipeline } from "../../rendering/AbstractRenderingPipeline";

export class HeightFieldShadowPipeline extends AbstractRenderingPipeline {
	protected primiteState: GPUPrimitiveState;
	protected vertexState: GPUVertexState;
	protected fragmentState: GPUFragmentState;
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
}

export const vertexEntryPoint = "vertex_main";
export const vertexGeometryEntryPoint = "vertex_geometry";
export const fragmentEntryPoint = "fragment_main";
export const fragmentSelectionEntryPoint = "fragment_selection";

export abstract class AbstractRenderingPipeline {
	protected label: string;
	protected _gpuPipeline!: GPURenderPipeline;

	protected shaderModule: GPUShaderModule;
	protected abstract primiteState: GPUPrimitiveState;
	protected abstract vertexState: GPUVertexState;
	protected abstract fragmentState: GPUFragmentState;
	protected multisample: GPUMultisampleState = {
		count: 1,
		mask: 0xffffffff,
		alphaToCoverageEnabled: false,
	};

	protected depthStencilState: GPUDepthStencilState | undefined = {
		format: "depth24plus",
		depthBias: 0,
		depthBiasClamp: 0,
		depthBiasSlopeScale: 0,
		depthCompare: "always",
		depthWriteEnabled: false,
		stencilFront: {
			compare: "always",
			failOp: "keep",
			depthFailOp: "keep",
			passOp: "keep",
		},
		stencilBack: {
			compare: "always",
			failOp: "keep",
			depthFailOp: "keep",
			passOp: "keep",
		},
		stencilReadMask: 0xffffffff,
		stencilWriteMask: 0xffffffff,
	};

	constructor(label: string, shaderModule: GPUShaderModule) {
		this.label = label;
		this.shaderModule = shaderModule;
	}

	protected buildPipeline(gpuDevice: GPUDevice, layout: GPUPipelineLayout): GPURenderPipeline {
		if (this._gpuPipeline) return this._gpuPipeline;
		const renderPipelineDescritor: GPURenderPipelineDescriptor = {
			label: this.label,
			primitive: this.primiteState,
			vertex: this.vertexState,
			fragment: this.fragmentState,
			depthStencil: this.depthStencilState,
			multisample: this.multisample,
			layout: layout,
		};
		this._gpuPipeline = gpuDevice.createRenderPipeline(renderPipelineDescritor);
		return this._gpuPipeline;
	}

	public get gpuPipeline(): GPURenderPipeline {
		return this._gpuPipeline;
	}
}

import { gpuDevice } from "../GPUX";

export const vertexEntryPoint = "vertex_main";
export const vertexGeometryEntryPoint = "vertex_geometry";
export const fragmentEntryPoint = "fragment_main";
export const fragmentSelectionEntryPoint = "fragment_selection";

export abstract class AbstractPipeline {
	abstract gpuPipeline: GPURenderPipeline;
	abstract readonly isDisplayOutputPipeline: boolean;
	readonly label: string;

	abstract readonly shaderModule: GPUShaderModule;

	abstract readonly vertexConstants: Record<string, number>;
	abstract readonly vertexBufferLayout: GPUVertexBufferLayout[];

	abstract readonly fragmentConstants: Record<string, number>;
	abstract readonly fragmentTargets: GPUColorTargetState[];

	abstract readonly topology: GPUPrimitiveTopology;
	abstract readonly cullMode: GPUCullMode;
	abstract readonly stripIndexFormat?: GPUIndexFormat;
	readonly frontFace: GPUFrontFace = "ccw";

	abstract readonly depthStencilFormat: GPUTextureFormat;
	abstract readonly depthCompare: GPUCompareFunction;
	abstract readonly depthWriteEnabled: boolean;
	readonly depthBias: number = 0;
	readonly depthBiasClamp: number = 0;
	readonly depthBiasSlopeScale: number = 0;
	readonly stencilFront: GPUStencilFaceState = {
		compare: "always",
		failOp: "keep",
		depthFailOp: "keep",
		passOp: "keep",
	};
	readonly stencilBack: GPUStencilFaceState = {
		compare: "always",
		failOp: "keep",
		depthFailOp: "keep",
		passOp: "keep",
	};
	readonly stencilReadMask: GPUStencilValue = 0xFFFFFFFF;
	readonly stencilWriteMask: GPUStencilValue = 0xFFFFFFFF;

	readonly multisample: GPUMultisampleState = {
		count: 1,
		mask: 0xFFFFFFFF,
		alphaToCoverageEnabled: false,
	};

	abstract readonly vertexEntryPoint: string;
	abstract readonly fragmentEntryPoint: string;

	constructor(label: string) {
		this.label = label;
	}

	abstract createPipelineLayout(): GPUPipelineLayout | "auto";

	protected createVertexState(): GPUVertexState {
		return {
			module: this.shaderModule,
			entryPoint: this.vertexEntryPoint,
			constants: this.vertexConstants,
			buffers: this.vertexBufferLayout
		};
	}

	protected createFragmentState(): GPUFragmentState {
		return {
			module: this.shaderModule,
			entryPoint: this.fragmentEntryPoint,
			constants: this.fragmentConstants,
			targets: this.fragmentTargets
		};
	}

	protected createDepthStencilState(): GPUDepthStencilState | undefined {
		return {
			format: this.depthStencilFormat,
			depthBias: this.depthBias,
			depthBiasClamp: this.depthBiasClamp,
			depthBiasSlopeScale: this.depthBiasSlopeScale,
			depthCompare: this.depthCompare,
			depthWriteEnabled: this.depthWriteEnabled,
			stencilBack: this.stencilBack,
			stencilFront: this.stencilFront,
			stencilReadMask: this.stencilReadMask,
			stencilWriteMask: this.stencilWriteMask
		};
	}

	protected createPrimitiveState(): GPUPrimitiveState {
		return {
			topology: this.topology,
			cullMode: this.cullMode,
			stripIndexFormat: this.stripIndexFormat,
			frontFace: this.frontFace,
		};
	}

	public buildPipeline(): GPURenderPipeline {
		const renderPipelineDescritor: GPURenderPipelineDescriptor = {
			label: this.label,
			vertex: this.createVertexState(),
			fragment: this.createFragmentState(),
			depthStencil: this.createDepthStencilState(),
			multisample: this.multisample,
			layout: this.createPipelineLayout(),
			primitive: this.createPrimitiveState(),
		};
		this.gpuPipeline = gpuDevice.createRenderPipeline(renderPipelineDescritor);
		return this.gpuPipeline;
	}
}
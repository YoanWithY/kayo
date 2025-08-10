import { Kayo } from "../Kayo";
import RealtimeRenderer from "../rendering/RealtimeRenderer";
import TransformationStack from "../transformation/TransformationStack";

let id = 1;
export default abstract class R3Object {
	public transformationStack;
	public defaultBindGroup: GPUBindGroup;
	public vertexUniformBuffer: GPUBuffer;
	public fragmentUniformBuffer: GPUBuffer;
	public isSelected: boolean = false;
	public isActive: boolean = false;
	private _id: number;
	public colorMatte = new Float32Array(2);

	public constructor(kayo: Kayo) {
		this.transformationStack = new TransformationStack();
		const { vertexUniformBuffer, fragmentUniformBuffer, bindGroup } = (
			kayo.renderers[RealtimeRenderer.rendererKey] as RealtimeRenderer
		).getNew3RData();
		this.vertexUniformBuffer = vertexUniformBuffer;
		this.fragmentUniformBuffer = fragmentUniformBuffer;
		this.defaultBindGroup = bindGroup;
		this._id = id++;
		this.colorMatte[0] = (this._id % 256) / 255;
		this.colorMatte[1] = (Math.floor(this._id / 256) % 256) / 255;
	}

	public getWorldLocation() {
		return this.transformationStack.getTransformationMatrix().getTranslation();
	}
	public vertexUniformData = new Float32Array(16);
	public fragmentUniformData = new Uint32Array(2);
	public updateUniforms(gpuDevice: GPUDevice) {
		this.transformationStack.getTransformationMatrix().pushInFloat32ArrayColumnMajor(this.vertexUniformData);

		this.fragmentUniformData[0] = this._id;
		this.fragmentUniformData[1] = this.isActive ? 2 : this.isSelected ? 1 : 0;
		gpuDevice.queue.writeBuffer(this.vertexUniformBuffer, 0, this.vertexUniformData);
		gpuDevice.queue.writeBuffer(this.fragmentUniformBuffer, 0, this.fragmentUniformData);
	}

	public get id() {
		return this._id;
	}

	public abstract render(renderPassEncoder: GPURenderPassEncoder): void;
	public abstract renderSelection(renderPassEncoder: GPURenderPassEncoder): void;
	public abstract renderDepth(renderPassEncoder: GPURenderPassEncoder): void;
}

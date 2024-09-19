import { gpuDevice } from "../GPUX";
import TransformationStack from "../transformation/TransformationStack";
import { Project } from "./Project";

let id = 1;
export default abstract class R3Object {
    transformationStack;
    defaultBindGroup: GPUBindGroup;
    vertexUniformBuffer: GPUBuffer;
    fragmentUniformBuffer: GPUBuffer;
    isSelected: boolean = false;
    isActive: boolean = false;
    private _id: number;
    colorMatte = new Float32Array(2);

    constructor(project: Project) {
        this.transformationStack = new TransformationStack();
        const { vertexUniformBuffer, fragmentUniformBuffer, bindGroup } = project.renderer.getNew3RData();
        this.vertexUniformBuffer = vertexUniformBuffer;
        this.fragmentUniformBuffer = fragmentUniformBuffer;
        this.defaultBindGroup = bindGroup;
        this._id = id++;
        this.colorMatte[0] = (this._id % 256) / 255;
        this.colorMatte[1] = (Math.floor(this._id / 256) % 256) / 255;
    }

    getWorldLocation() {
        return this.transformationStack.getTransformationMatrix().getTranslation();
    }
    vertexUniformData = new Float32Array(16);
    fragmentUniformData = new Uint32Array(2);
    updateUniforms() {
        this.transformationStack.getTransformationMatrix().pushInFloat32ArrayColumnMajor(this.vertexUniformData);
   
        this.fragmentUniformData[0] = this._id;
        this.fragmentUniformData[1] =  this.isActive ? 2 : (this.isSelected ? 1 : 0);
        gpuDevice.queue.writeBuffer(this.vertexUniformBuffer, 0, this.vertexUniformData);
        gpuDevice.queue.writeBuffer(this.fragmentUniformBuffer, 0, this.fragmentUniformData);
    }

    get id() {
        return this._id;
    }

    abstract render(renderPassEncoder: GPURenderPassEncoder): void;
    abstract renderSelection(renderPassEncoder: GPURenderPassEncoder): void;
}

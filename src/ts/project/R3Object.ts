import { gpuDevice } from "../GPUX";
import TransformationStack from "../transformation/TransformationStack";
import { Project } from "./Project";

export default abstract class R3Object {
    transformationStack;
    defaultBindGroup: GPUBindGroup;
    vertexUniformBuffer: GPUBuffer;
    fragmentUniformBuffer: GPUBuffer;
    isSelected: boolean = false;
    isActive: boolean = false;

    constructor(project: Project) {
        this.transformationStack = new TransformationStack();
        const { vertexUniformBuffer, fragmentUniformBuffer, bindGroup } = project.renderer.getNew3RData();
        this.vertexUniformBuffer = vertexUniformBuffer;
        this.fragmentUniformBuffer = fragmentUniformBuffer;
        this.defaultBindGroup = bindGroup;
    }

    getWorldLocation() {
        return this.transformationStack.getTransformationMatrix().getTranslation();
    }
    vertexUniformData = new Float32Array(16);
    fragmentUniformData = new Uint32Array(1);
    updateUniforms() {
        this.transformationStack.getTransformationMatrix().pushInFloat32ArrayColumnMajor(this.vertexUniformData);
        const selectedMask = this.isSelected ? 1 : 0;
        const activeMask = this.isActive ? 2 : 0;
        this.fragmentUniformData[0] = selectedMask | activeMask;
        gpuDevice.queue.writeBuffer(this.vertexUniformBuffer, 0, this.vertexUniformData);
        gpuDevice.queue.writeBuffer(this.fragmentUniformBuffer, 0, this.fragmentUniformData);
    }
}

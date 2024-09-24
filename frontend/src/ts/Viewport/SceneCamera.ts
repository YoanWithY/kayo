import R3Object from "../project/R3Object";
import PerspectiveProjection from "../projection/PerspectiveProjection";
import Projection from "../projection/Projection";
import Camera from "./Camera";

export default class SceneCamera extends R3Object implements Camera {
    renderDepth(renderPassEncoder: GPURenderPassEncoder): void {
        renderPassEncoder;
        throw new Error("Method not implemented.");
    }
    render(renderPassEncoder: GPURenderPassEncoder): void {
        renderPassEncoder;
        throw new Error("Method not implemented.");
    }
    renderSelection(renderPassEncoder: GPURenderPassEncoder): void {
        renderPassEncoder;
        throw new Error("Method not implemented.");
    }
    projection = new PerspectiveProjection();
    updateGPU(): void {
        throw new Error("Method not implemented.");
    }

    getProjection(): Projection {
        throw new Error("Method not implemented.");
    }

    getViewMatrix() {
        return this.transformationStack.getInverseTransformationMatrix();
    }
}
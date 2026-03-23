import R3Object from "../project/R3Object";
import PerspectiveProjection from "../projection/PerspectiveProjection";
import Projection from "../projection/Projection";
import Camera from "./Camera";

export default class SceneCamera extends R3Object implements Camera {
	public renderDepth(_: GPURenderPassEncoder): void {
		throw new Error("Method not implemented.");
	}
	public render(_: GPURenderPassEncoder): void {
		throw new Error("Method not implemented.");
	}
	public renderSelection(_: GPURenderPassEncoder): void {
		throw new Error("Method not implemented.");
	}
	public projection = new PerspectiveProjection();
	public updateGPU(): void {
		throw new Error("Method not implemented.");
	}

	public getProjection(): Projection {
		throw new Error("Method not implemented.");
	}

	public getViewMatrix() {
		return this.transformationStack.getInverseTransformationMatrix();
	}
}

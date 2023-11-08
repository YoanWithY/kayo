import mat4 from "../math/mat4";
import { toRAD } from "../math/math";
import R3Object from "../project/R3Object";
import PerspectiveProjection from "../projection/PerspectiveProjection";
import { glCanvas } from "../rendering/glInit";
import Camera from "./Camera";

export default class SceneCamera extends R3Object implements Camera {
    projection = new PerspectiveProjection();
    updateGPU(): void {
        throw new Error("Method not implemented.");
    }

    getProjectionMatrix(width: number, height: number): mat4 {
        return this.projection.getProjectionMatrix(width, height);
    }

    getViewMatrix() {
        return this.transformationStack.getInverseEffectTransformationMatrix();
    }
}
import { perspective, toRAD } from "../math/math";
import R3Object from "../project/R3Object";
import { glCanvas } from "../rendering/glInit";
import Camera from "./Camera";

export default class SceneCamera extends R3Object implements Camera {
    updateGPU(): void {
        throw new Error("Method not implemented.");
    }

    getProjectionMatrix() {
        return perspective(toRAD(90), glCanvas.width / glCanvas.height, 0.1, 1000);
    }

    getViewMatrix() {
        return this.transformationStack.getInverseEffectTransformationMatrix();
    }
}
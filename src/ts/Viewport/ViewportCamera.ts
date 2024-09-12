import mat4 from "../math/mat4";
import vec3 from "../math/vec3";
import PerspectiveProjection from "../projection/PerspectiveProjection";
import TransformationStack from "../transformation/TransformationStack";
import Camera from "./Camera";

/**
 * A Camera that is capabale of being a viewport.
 */
export default class ViewportCamera implements Camera {
    projection = new PerspectiveProjection();
    transformationStack = new TransformationStack();

    getProjectionMatrix(width: number, height: number): mat4 {
        return this.projection.getProjectionMatrix(width, height);
    }
    getViewMatrix(): mat4 {
        return this.transformationStack.getInverseTransformationMatrix();
    }
    getWorldLocation(): vec3 {
        return this.transformationStack.getTransformationMatrix().getTranslation();
    }

}
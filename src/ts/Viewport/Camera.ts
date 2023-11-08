import mat4 from "../math/mat4";
import vec3 from "../math/vec3";
import TransformationStack from "../transformation/TransformationStack";

/**
 * A minimal interface that describes the functionality of a camera.
 */
export default interface Camera {
    transformationStack: TransformationStack;
    getProjectionMatrix(width: number, height: number): mat4;
    getViewMatrix(): mat4;
    getWorldLocation(): vec3;
}
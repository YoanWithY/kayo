import mat4 from "../math/mat4";
import Scene from "../project/Scene";

export const scene = new Scene();


export default interface Projection {
    /**
     * Returns a projection matrix.
     * @param width the width of the target viewport
     * @param height the height of the target viewport
     */
    getProjectionMatrix(width: number, height: number): mat4;
}
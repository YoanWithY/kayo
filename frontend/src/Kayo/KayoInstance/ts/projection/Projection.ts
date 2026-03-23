import mat4 from "../math/mat4";

export default interface Projection {
	near: number;
	far: number;
	/**
	 * Returns a projection matrix.
	 * @param width the width of the target viewport
	 * @param height the height of the target viewport
	 */
	getProjectionMatrix(width: number, height: number): mat4;
}

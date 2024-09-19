import mat4 from "../math/mat4";

export default interface Transformation {

    getTransformationMatrix(): mat4

    getInverseTransformationMatrix(): mat4
    /**
     * Sets values for this transformation.
     * @param nums the number to set
     */
    setValues(...nums: number[]): void

    getName(): string
}
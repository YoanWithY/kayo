
function toDEG(RAD) {
    return RAD * 57.295779513082320876798154814105;
}

function toRAD(DEG) {
    return DEG * 0.01745329251994329576923690768489;
}

/**
 * @class Providing static acces to typical matrix 4x4 functionalities.
 * @author YoGames Studios */
class mat4 {

    /**Applies a translation transformatio to the given matrix by the specified x, y and z coordinates.
     * The effect of the transformation will occure befor the effect of the original matrix.
     * @param {number[]} mat the matrix to apply the transformatio onto.
     * @param {number} x the x translation.
     * @param {number} y the y translation.
     * @param {number} z the z translation.
     * @returns the new matrix.
     */
    static translate(mat, x, y, z) {
        return mat4.mult(mat, mat4.translation(x, y, z));
    }

    /**Applies a x-axis-rotation transformation to the given matrix by the specified angle in radians.
     * The effect of the transformation will occure befor the effect of the original matrix.
     * @param {number[]} mat the matrix to apply the transformatio onto.
     * @param {number} a the angle to rotate in radians.
     * @returns the new matrix.
     */
    static rotateX(mat, a) {
        return mat4.mult(mat, mat4.rotationX(a));
    }

    /**Applies a y-axis-rotation transformation to the given matrix by the specified angle in radians.
     * The effect of the transformation will occure befor the effect of the original matrix.
     * @param {number[]} mat the matrix to apply the transformatio onto.
     * @param {number} a the angle to rotate in radians.
     * @returns the new matrix.
     */
    static rotateY(mat, a) {
        return mat4.mult(mat, mat4.rotationY(a));
    }

    /**Applies a z-axis-rotation transformation to the given matrix by the specified angle in radians.
     * The effect of the transformation will occure befor the effect of the original matrix.
     * @param {number[]} mat the matrix to apply the transformatio onto.
     * @param {number} a the angle to rotate in radians.
     * @returns the new matrix.
     */
    static rotateZ(mat, a) {
        return mat4.mult(mat, mat4.rotationZ(a));
    }

    /**Applies a scale transformation to the given matrix by the specified x, y and z coordinates.
     * The effect of the transformation will occure befor the effect of the original matrix.
     * @param {number[]} mat the matrix to apply the transformatio onto.
     * @param {number} x the x translation.
     * @param {number} y the y translation.
     * @param {number} z the z translation.
     * @returns the new matrix.
     */
    static scale(mat, x, y, z) {
        return mat4.mult(mat, mat4.scaleation(x, y, z));
    }

    /** Multiplies the 4x4 matrices a and b and returnes the result in a new matrix. 
     * @param {number[]} a matrix 1
     * @param {number[]} b matrix 2
     * @returns the result
     */
    static mult(a, b) {
        return [a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15], a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15], a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15], a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]];
    }

    /**Returns a translation matrix
     * @param {number} x translation on the x-axis.
     * @param {number} y translation on the y-axis.
     * @param {number} z translation on the z-axis.
     * @returns the matrix
     */
    static translation(x, y, z) {
        return [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
    }

    /**Return a x-axis-rotation matrix.
     * @param a the angle to rotate in radians.
     * @returns the matrix
     */
    static rotationX(a) {
        const cosa = Math.cos(a);
        const sina = Math.sin(a);
        return [
            1, 0, 0, 0,
            0, cosa, -sina, 0,
            0, sina, cosa, 0,
            0, 0, 0, 1]
    }

    /**Return a y-axis-rotation matrix.
     * @param a the angle to rotate in radians.
     * @return the matrix
     */
    static rotationY(a) {
        const cosa = Math.cos(a);
        const sina = Math.sin(a);
        return [cosa, 0, sina, 0, 0, 1, 0, 0, -sina, 0, cosa, 0, 0, 0, 0, 1]
    }

    /**Return a z-axis-rotation matrix.
     * @param {number} a the angle to rotate in radians.
     * @returns the matrix
     */
    static rotationZ(a) {
        const cosa = Math.cos(a);
        const sina = Math.sin(a);
        return [cosa, -sina, 0, 0, sina, cosa, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    }

    /**Returns a scalelation matrix.
     * @param {number} x scale along the x-axis.
     * @param {number} y scale along the y-axis.
     * @param {number} z scale along the z-axis.
     * @returns the matrix
     */
    static scaleation(x, y, z) {
        return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
    }

    static perspective(vFOV, AR, n, f) {
        const t = Math.tan(toRAD(vFOV) / 2) * n;
        const t2 = t * 2;
        const r = t * AR;
        const r2 = r * 2;
        const d = f - n;
        const n2 = 2 * n;
        return [n2 / r2, 0, 0, 0, 0, n2 / t2, 0, 0, 0, 0, -(f + n) / d, -n2 * f / d, 0, 0, -1, 0];
    }
}
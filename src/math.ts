function toDEG(RAD: number) {
    return RAD * 57.295779513082320876798154814105;
}

function toRAD(DEG: number) {
    return DEG * 0.01745329251994329576923690768489;
}

/**
 * @class Providing static to typical vector 2 functionalities.
 * @author YoGames Studios */
class vec2 {
    static add(a: number[], b: number[]) {
        return [a[0] + b[0], a[1] + b[1]];
    }

    static sub(a: number[], b: number[]) {
        return [a[0] - b[0], a[1] - b[1]];
    }

    static mul(a: number[], b: number[]) {
        return [a[0] * b[0], a[1] * b[1]];
    }

    static div(a: number[], b: number[]) {
        return [a[0] / b[0], a[1] / b[1]];
    }

    static scalarAdd(v: number[], s: number) {
        return [v[0] + s, v[1] + s];
    }

    static scalarSub(v: number[], s: number) {
        return [v[0] - s, v[1] - s];
    }

    static scalarMul(v: number[], s: number) {
        return [v[0] * s, v[1] * s];
    }

    static scalarDiv(v: number[], s: number) {
        return [v[0] / s, v[1] / s];
    }

    static norm(a: number[]) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    }

    static normalize(a: number[]) {
        const l = 1.0 / vec2.norm(a);
        return [a[0] * l, a[1] * l, a[2] * l];
    }

    static xy(a: number[]) {
        return [a[0], a[1]];
    }
}

/**
 * @class Providing static to typical vector 3 functionalities.
 * @author YoGames Studios */
class vec3 extends vec2 {
    static readonly X = [1, 0, 0];
    static readonly Y = [0, 1, 0];
    static readonly Z = [0, 0, 1];

    static add(a: number[], b: number[]) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    }

    static sub(a: number[], b: number[]) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }

    static mul(a: number[], b: number[]) {
        return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
    }

    static div(a: number[], b: number[]) {
        return [a[0] / b[0], a[1] / b[1], a[2] / b[2]];
    }

    static scalarAdd(v: number[], s: number) {
        return [v[0] + s, v[1] + s, v[2] + s];
    }

    static scalarSub(v: number[], s: number) {
        return [v[0] - s, v[1] - s, v[2] - s];
    }

    static scalarMul(v: number[], s: number) {
        return [v[0] * s, v[1] * s, v[2] * s];
    }

    static scalarDiv(v: number[], s: number) {
        return [v[0] / s, v[1] / s, v[2] / s];
    }

    static cross(a: number[], b: number[]) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    static norm(a: number[]) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    }

    static sphericalToEuclidian(theta: number, phi: number, r: number) {
        const st = Math.sin(theta);
        return [r * st * Math.cos(phi), r * st * Math.sin(phi), r * Math.cos(theta)];
    }

    static sphericalToEuclidian2(theta: number, phi: number) {
        const st = Math.sin(theta);
        return [st * Math.cos(phi), st * Math.sin(phi), Math.cos(theta)];
    }

    static normalize(a: number[]) {
        const l = 1.0 / vec3.norm(a);
        return [a[0] * l, a[1] * l, a[2] * l];
    }

    static xyz(a: number[]) {
        return [a[0], a[1], a[2]];
    }
}

/**
 * @class Providing static to typical vector 4 functionalities.
 * @author YoGames Studios */
class vec4 extends vec3 {

    static add(a: number[], b: number[]) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
    }

    static sub(a: number[], b: number[]) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
    }

    static mul(a: number[], b: number[]) {
        return [a[0] * b[0], a[1] * b[1], a[2] * b[2], a[3] * b[3]];
    }

    static div(a: number[], b: number[]) {
        return [a[0] / b[0], a[1] / b[1], a[2] / b[2], a[3] / b[3]];
    }

    static scalarAdd(v: number[], s: number) {
        return [v[0] + s, v[1] + s, v[2] + s, v[3] + s];
    }

    static scalarSub(v: number[], s: number) {
        return [v[0] - s, v[1] - s, v[2] - s, v[3] - s];
    }

    static scalarMul(v: number[], s: number) {
        return [v[0] * s, v[1] * s, v[2] * s, v[3] * s];
    }

    static scalarDiv(v: number[], s: number) {
        return [v[0] / s, v[1] / s, v[2] / s, v[3] / s];
    }

    static norm(a: number[]) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] * a[3] * a[3]);
    }

    static normalize(a: number[]) {
        const l = 1.0 / vec4.norm(a);
        return [a[0] * l, a[1] * l, a[2] * l, a[3] * l];
    }
}

/**
 * @class Providing static to typical matrix 4x4 functionalities.
 * @author YoGames Studios */
class mat4 {

    /**Applies a translation transformatio to the given matrix by the specified x, y and z coordinates.
     * The effect of the transformation will occure befor the effect of the original matrix.
     * @param mat the matrix to apply the transformatio onto.
     * @param x the x translation.
     * @param y the y translation.
     * @param z the z translation.
     * @returns the new matrix.
     */
    static translate(mat: number[], x: number, y: number, z: number) {
        return mat4.mult(mat, mat4.translation(x, y, z));
    }

    /**Applies a x-axis-rotation transformation to the given matrix by the specified angle in radians.
     * The effect of the transformation will occure befor the effect of the original matrix.
     * @param mat the matrix to apply the transformatio onto.
     * @param a the angle to rotate in radians.
     * @returns the new matrix.
     */
    static rotateX(mat: number[], a: number) {
        return mat4.mult(mat, mat4.rotationX(a));
    }

    /**Applies a y-axis-rotation transformation to the given matrix by the specified angle in radians.
     * The effect of the transformation will occure befor the effect of the original matrix.
     * @param mat the matrix to apply the transformatio onto.
     * @param a the angle to rotate in radians.
     * @returns the new matrix.
     */
    static rotateY(mat: number[], a: number) {
        return mat4.mult(mat, mat4.rotationY(a));
    }

    /**Applies a z-axis-rotation transformation to the given matrix by the specified angle in radians.
     * The effect of the transformation will occure befor the effect of the original matrix.
     * @param mat the matrix to apply the transformatio onto.
     * @param a the angle to rotate in radians.
     * @returns the new matrix.
     */
    static rotateZ(mat: number[], a: number) {
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
    static scale(mat: number[], x: number, y: number, z: number) {
        return mat4.mult(mat, mat4.scaleation(x, y, z));
    }

    /** Multiplies the 4x4 matrices a and b and returnes the result in a new matrix. 
     * @param a matrix 1
     * @param b matrix 2
     * @returns the result
     */
    static mult(a: number[], b: number[]) {
        return [b[0] * a[0] + b[1] * a[4] + b[2] * a[8] + b[3] * a[12], b[0] * a[1] + b[1] * a[5] + b[2] * a[9] + b[3] * a[13], b[0] * a[2] + b[1] * a[6] + b[2] * a[10] + b[3] * a[14], b[0] * a[3] + b[1] * a[7] + b[2] * a[11] + b[3] * a[15], b[4] * a[0] + b[5] * a[4] + b[6] * a[8] + b[7] * a[12], b[4] * a[1] + b[5] * a[5] + b[6] * a[9] + b[7] * a[13], b[4] * a[2] + b[5] * a[6] + b[6] * a[10] + b[7] * a[14], b[4] * a[3] + b[5] * a[7] + b[6] * a[11] + b[7] * a[15], b[8] * a[0] + b[9] * a[4] + b[10] * a[8] + b[11] * a[12], b[8] * a[1] + b[9] * a[5] + b[10] * a[9] + b[11] * a[13], b[8] * a[2] + b[9] * a[6] + b[10] * a[10] + b[11] * a[14], b[8] * a[3] + b[9] * a[7] + b[10] * a[11] + b[11] * a[15], b[12] * a[0] + b[13] * a[4] + b[14] * a[8] + b[15] * a[12], b[12] * a[1] + b[13] * a[5] + b[14] * a[9] + b[15] * a[13], b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14], b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15]];
    }

    /** Multiplies the 4x4 matrices m with the vec4 v and returnes the result in a new vec4. 
     * @param m mat4
     * @param v vec4
     * @returns the result
     */
    static multVec(m: number[], v: number[]) {
        const vec = [v[0] * m[0] + v[1] * m[4] + v[2] * m[8] + v[3] * m[12], v[0] * m[1] + v[1] * m[5] + v[2] * m[9] + v[3] * m[13], v[0] * m[2] + v[1] * m[6] + v[2] * m[10] + v[3] * m[14], v[0] * m[3] + v[1] * m[7] + v[2] * m[11] + v[3] * m[15]];
        const w = vec[3];
        if (w !== 1 && w !== 0) {
            vec[0] /= w;
            vec[1] /= w;
            vec[2] /= w;
            vec[3] = 1;
        }
        return vec;
    }

    /**Returns the transpose of m.
     * @param m matrix
     * @returns the transpose of m
     */
    static transpose(m: number[]) {
        return [m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15]];
    }

    static getTranslation(m: number[]) {
        return [m[12], m[13], m[14]];
    }

    /**Returns a translation matrix
     * @param {number} x translation on the x-axis.
     * @param {number} y translation on the y-axis.
     * @param {number} z translation on the z-axis.
     * @returns the matrix
     */
    static translation(x: number, y: number, z: number) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1];
    }

    /**Return a x-axis-rotation matrix.
     * @param a the angle to rotate in radians.
     * @returns the matrix
     */
    static rotationX(a: number) {
        const cosa = Math.cos(a);
        const sina = Math.sin(a);
        return [
            1, 0, 0, 0,
            0, cosa, sina, 0,
            0, -sina, cosa, 0,
            0, 0, 0, 1]
    }

    /**Return a y-axis-rotation matrix.
     * @param a the angle to rotate in radians.
     * @return the matrix
     */
    static rotationY(a: number) {
        const cosa = Math.cos(a);
        const sina = Math.sin(a);
        return [
            cosa, 0, -sina, 0,
            0, 1, 0, 0,
            sina, 0, cosa, 0,
            0, 0, 0, 1]
    }

    /**Return a z-axis-rotation matrix.
     * @param a the angle to rotate in radians.
     * @returns the matrix
     */
    static rotationZ(a: number) {
        const cosa = Math.cos(a);
        const sina = Math.sin(a);
        return [
            cosa, sina, 0, 0,
            -sina, cosa, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1]
    }

    /**Returns a scalelation matrix.
     * @param x scale along the x-axis.
     * @param y scale along the y-axis.
     * @param z scale along the z-axis.
     * @returns the matrix
     */
    static scaleation(x: number, y: number, z: number) {
        return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
    }

    static identity() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    static perspective(vFOV: number, AR: number, n: number, f: number) {
        const t = Math.tan(toRAD(vFOV) / 2) * n;
        const t2 = t * 2;
        const r = t * AR;
        const r2 = r * 2;
        const d = f - n;
        const n2 = 2 * n;

        return [
            n2 / r2, 0, 0, 0,
            0, n2 / t2, 0, 0,
            0, 0, -(f + n) / d, -1,
            0, 0, -n2 * f / d, 0];
    }
}
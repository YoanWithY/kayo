"use strict";
function toDEG(RAD) {
    return RAD * 57.295779513082320876798154814105;
}
function toRAD(DEG) {
    return DEG * 0.01745329251994329576923690768489;
}
class vec2 {
    static add(a, b) {
        return [a[0] + b[0], a[1] + b[1]];
    }
    static sub(a, b) {
        return [a[0] - b[0], a[1] - b[1]];
    }
    static mul(a, b) {
        return [a[0] * b[0], a[1] * b[1]];
    }
    static div(a, b) {
        return [a[0] / b[0], a[1] / b[1]];
    }
    static scalarAdd(v, s) {
        return [v[0] + s, v[1] + s];
    }
    static scalarSub(v, s) {
        return [v[0] - s, v[1] - s];
    }
    static scalarMul(v, s) {
        return [v[0] * s, v[1] * s];
    }
    static scalarDiv(v, s) {
        return [v[0] / s, v[1] / s];
    }
    static norm(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    }
    static normalize(a) {
        const l = 1.0 / vec2.norm(a);
        return [a[0] * l, a[1] * l, a[2] * l];
    }
    static xy(a) {
        return [a[0], a[1]];
    }
}
class vec3 extends vec2 {
    static add(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    }
    static sub(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }
    static mul(a, b) {
        return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
    }
    static div(a, b) {
        return [a[0] / b[0], a[1] / b[1], a[2] / b[2]];
    }
    static scalarAdd(v, s) {
        return [v[0] + s, v[1] + s, v[2] + s];
    }
    static scalarSub(v, s) {
        return [v[0] - s, v[1] - s, v[2] - s];
    }
    static scalarMul(v, s) {
        return [v[0] * s, v[1] * s, v[2] * s];
    }
    static scalarDiv(v, s) {
        return [v[0] / s, v[1] / s, v[2] / s];
    }
    static norm(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    }
    static normalize(a) {
        const l = 1.0 / vec3.norm(a);
        return [a[0] * l, a[1] * l, a[2] * l];
    }
    static xyz(a) {
        return [a[0], a[1], a[2]];
    }
}
class vec4 extends vec3 {
    static add(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
    }
    static sub(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
    }
    static mul(a, b) {
        return [a[0] * b[0], a[1] * b[1], a[2] * b[2], a[3] * b[3]];
    }
    static div(a, b) {
        return [a[0] / b[0], a[1] / b[1], a[2] / b[2], a[3] / b[3]];
    }
    static scalarAdd(v, s) {
        return [v[0] + s, v[1] + s, v[2] + s, v[3] + s];
    }
    static scalarSub(v, s) {
        return [v[0] - s, v[1] - s, v[2] - s, v[3] - s];
    }
    static scalarMul(v, s) {
        return [v[0] * s, v[1] * s, v[2] * s, v[3] * s];
    }
    static scalarDiv(v, s) {
        return [v[0] / s, v[1] / s, v[2] / s, v[3] / s];
    }
    static norm(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] * a[3] * a[3]);
    }
    static normalize(a) {
        const l = 1.0 / vec4.norm(a);
        return [a[0] * l, a[1] * l, a[2] * l, a[3] * l];
    }
}
class mat4 {
    static translate(mat, x, y, z) {
        return mat4.mult(mat, mat4.translation(x, y, z));
    }
    static rotateX(mat, a) {
        return mat4.mult(mat, mat4.rotationX(a));
    }
    static rotateY(mat, a) {
        return mat4.mult(mat, mat4.rotationY(a));
    }
    static rotateZ(mat, a) {
        return mat4.mult(mat, mat4.rotationZ(a));
    }
    static scale(mat, x, y, z) {
        return mat4.mult(mat, mat4.scaleation(x, y, z));
    }
    static mult(a, b) {
        return [b[0] * a[0] + b[1] * a[4] + b[2] * a[8] + b[3] * a[12], b[0] * a[1] + b[1] * a[5] + b[2] * a[9] + b[3] * a[13], b[0] * a[2] + b[1] * a[6] + b[2] * a[10] + b[3] * a[14], b[0] * a[3] + b[1] * a[7] + b[2] * a[11] + b[3] * a[15], b[4] * a[0] + b[5] * a[4] + b[6] * a[8] + b[7] * a[12], b[4] * a[1] + b[5] * a[5] + b[6] * a[9] + b[7] * a[13], b[4] * a[2] + b[5] * a[6] + b[6] * a[10] + b[7] * a[14], b[4] * a[3] + b[5] * a[7] + b[6] * a[11] + b[7] * a[15], b[8] * a[0] + b[9] * a[4] + b[10] * a[8] + b[11] * a[12], b[8] * a[1] + b[9] * a[5] + b[10] * a[9] + b[11] * a[13], b[8] * a[2] + b[9] * a[6] + b[10] * a[10] + b[11] * a[14], b[8] * a[3] + b[9] * a[7] + b[10] * a[11] + b[11] * a[15], b[12] * a[0] + b[13] * a[4] + b[14] * a[8] + b[15] * a[12], b[12] * a[1] + b[13] * a[5] + b[14] * a[9] + b[15] * a[13], b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14], b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15]];
    }
    static multVec(m, v) {
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
    static transpose(m) {
        return [m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15]];
    }
    static translation(x, y, z) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ];
    }
    static rotationX(a) {
        const cosa = Math.cos(a);
        const sina = Math.sin(a);
        return [
            1, 0, 0, 0,
            0, cosa, sina, 0,
            0, -sina, cosa, 0,
            0, 0, 0, 1
        ];
    }
    static rotationY(a) {
        const cosa = Math.cos(a);
        const sina = Math.sin(a);
        return [
            cosa, 0, -sina, 0,
            0, 1, 0, 0,
            sina, 0, cosa, 0,
            0, 0, 0, 1
        ];
    }
    static rotationZ(a) {
        const cosa = Math.cos(a);
        const sina = Math.sin(a);
        return [
            cosa, sina, 0, 0,
            -sina, cosa, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }
    static scaleation(x, y, z) {
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
    static perspective(vFOV, AR, n, f) {
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
            0, 0, -n2 * f / d, 0
        ];
    }
}

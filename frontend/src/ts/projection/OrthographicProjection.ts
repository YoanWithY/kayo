import mat4 from "../math/mat4";
import Projection from "./Projection";

export default class OrthographicProjection implements Projection {
    height: number;
    near: number;
    far: number;
    constructor(height: number = 100, near: number = 0.0, far: number = 1000) {
        this.height = height;
        this.near = near;
        this.far = far;
    }
    getProjectionMatrix(width: number, height: number): mat4 {
        const AR = width / height;
        const t = this.height / 2;
        const b = -t;
        const r = t * AR;
        const l = -r;
        return mat4.orthographic(r, l, t, b, this.near, this.far);
    }
}
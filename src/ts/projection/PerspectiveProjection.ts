import mat4 from "../math/mat4";
import Projection from "./Projection";

export default class PerspectiveProjection implements Projection {
    vFOV = 90;
    near = 0.1;
    far = 1000;
    getProjectionMatrix(width: number, height: number): mat4 {
        const AR = width / height;
        const t = Math.tan(this.vFOV / 2) * this.near;
        const b = -t;
        const r = t * AR;
        const l = -r;
        return mat4.perspective(r, l, t, b, this.near, this.far);
    }
}
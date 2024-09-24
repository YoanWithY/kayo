import mat4 from "../math/mat4";
import Projection from "./Projection";

export default class OrthographicProjection implements Projection {
    height = 100;
    near = 0.0;
    far = 10000;
    getProjectionMatrix(width: number, height: number): mat4 {
        const AR = width / height;
        const t = this.height / 2;
        const b = -t;
        const r = t * AR;
        const l = -r;
        return mat4.orthographic(r, l, t, b, this.near, this.far);
    }
}
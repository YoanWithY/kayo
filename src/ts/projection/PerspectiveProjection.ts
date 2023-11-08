import mat4 from "../math/mat4";
import { perspective, toRAD } from "../math/math";
import Projection from "./Projection";

export default class PerspectiveProjection implements Projection {
    FOV = 90;
    getProjectionMatrix(width: number, height: number): mat4 {
        return perspective(toRAD(this.FOV), width / height, 0.1, 1000);
    }

}
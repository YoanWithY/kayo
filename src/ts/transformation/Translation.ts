import mat4 from "../math/mat4";
import Transformation from "./Transformation";

export default class Translation implements Transformation {
    x = 0; y = 0; z = 0;
    getTransformationMatrix() {
        return mat4.translation(this.x, this.y, this.z);
    }

    getInverseEffectTransformationMatrix() {
        return mat4.translation(-this.x, -this.y, -this.z);
    }

    setValues(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getName() {
        return "Translation";
    }
}
import mat4 from "../math/mat4";
import Transformation from "./Transformation";

export default class Scale implements Transformation {
	x = 1;
	y = 1;
	z = 1;
	getTransformationMatrix() {
		return mat4.scaleation(this.x, this.y, this.z);
	}

	getInverseTransformationMatrix() {
		return mat4.scaleation(1 / this.x, 1 / this.y, 1 / this.z);
	}

	setValues(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	getName() {
		return "Scale";
	}
}

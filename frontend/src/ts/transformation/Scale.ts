import mat4 from "../math/mat4";
import Transformation from "./Transformation";

export default class Scale implements Transformation {
	public x = 1;
	public y = 1;
	public z = 1;
	public getTransformationMatrix() {
		return mat4.scaleation(this.x, this.y, this.z);
	}

	public getInverseTransformationMatrix() {
		return mat4.scaleation(1 / this.x, 1 / this.y, 1 / this.z);
	}

	public setValues(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	public getName() {
		return "Scale";
	}
}

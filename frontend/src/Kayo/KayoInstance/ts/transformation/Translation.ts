import mat4 from "../math/mat4";
import Transformation from "./Transformation";

export default class Translation implements Transformation {
	public x = 0;
	public y = 0;
	public z = 0;
	public getTransformationMatrix() {
		return mat4.translation(this.x, this.y, this.z);
	}

	public getInverseTransformationMatrix() {
		return mat4.translation(-this.x, -this.y, -this.z);
	}

	public setValues(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	public getName() {
		return "Translation";
	}
}

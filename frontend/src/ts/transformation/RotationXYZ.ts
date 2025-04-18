import mat4 from "../math/mat4";
import Transformation from "./Transformation";

export default class RotationXYZ implements Transformation {
	x = 0;
	y = 0;
	z = 0;
	getTransformationMatrix() {
		return mat4.rotationX(this.x).rotateY(this.y).rotateZ(this.z);
	}

	getInverseTransformationMatrix() {
		return mat4.rotationZ(-this.z).rotateY(-this.y).rotateX(-this.x);
	}

	setValues(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	getName() {
		return "Rotation XYZ";
	}
}

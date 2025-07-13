import mat4 from "../math/mat4";
import Transformation from "./Transformation";

export default class RotationXYZ implements Transformation {
	public x = 0;
	public y = 0;
	public z = 0;
	public getTransformationMatrix() {
		return mat4.rotationX(this.x).rotateY(this.y).rotateZ(this.z);
	}

	public getInverseTransformationMatrix() {
		return mat4.rotationZ(-this.z).rotateY(-this.y).rotateX(-this.x);
	}

	public setValues(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	public getName() {
		return "Rotation XYZ";
	}
}

import mat4 from "../math/mat4";
import Scale from "./Scale";
import RotationXYZ from "./RotationXYZ";
import Translation from "./Translation";
import Transformation from "./Transformation";

export default class TransformationStack extends Array implements Transformation {
	public scale = new Scale();
	public rotate = new RotationXYZ();
	public translate = new Translation();

	public constructor() {
		super();
	}

	public setValues(): void {}

	public getName(): string {
		return "transformation Stack";
	}

	public getTransformationMatrix(): mat4 {
		let ret = mat4.identity();
		for (let i = this.length - 1; i >= 0; i--) ret = ret.mult(this[i].getTransformationMatrix());

		ret = ret
			.mult(this.translate.getTransformationMatrix())
			.mult(this.rotate.getTransformationMatrix())
			.mult(this.scale.getTransformationMatrix());
		return ret;
	}

	public getInverseTransformationMatrix(): mat4 {
		let ret = this.scale
			.getInverseTransformationMatrix()
			.mult(this.rotate.getInverseTransformationMatrix())
			.mult(this.translate.getInverseTransformationMatrix());
		for (let i = 0; i < this.length; i++) ret = ret.mult(this[i].getInverseTransformationMatrix());
		return ret;
	}
}

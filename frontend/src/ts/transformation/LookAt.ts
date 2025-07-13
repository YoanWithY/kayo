import mat4 from "../math/mat4";
import * as Maths from "../math/math";
import vec3 from "../math/vec3";
import Transformation from "./Transformation";

export default class LookAtTransform implements Transformation {
	/**
	 * The Point to look at.
	 */
	public p: vec3;

	/**
	 * The polar angle.
	 */
	public theta: number;

	/**
	 * The azimuthal angle.
	 */
	public phi: number;

	/**
	 * The distance to the point (radius on the sphere).
	 */
	public r: number;

	public constructor(p = new vec3(), r = 15, theta = Maths.toRAD(90), phi = 0) {
		this.p = p;
		this.r = r;
		this.theta = theta;
		this.phi = phi;
	}

	public getTransformationMatrix() {
		const dir = vec3.sphericalToEuclidean(this.theta, this.phi, this.r);
		const loc = this.p.add(dir);
		const Z = dir.normalize();
		const Y = vec3.longitudeTangent(this.theta, this.phi).mulS(-1);
		const X = Y.cross(Z).normalize();
		return mat4.fromColumnMajor(...X, 0, ...Y, 0, ...Z, 0, ...loc, 1);
	}

	public getInverseTransformationMatrix() {
		const dir = vec3.sphericalToEuclidean(this.theta, this.phi, this.r);
		const loc = this.p.add(dir);
		const Z = dir.normalize();
		const Y = vec3.longitudeTangent(this.theta, this.phi).mulS(-1);
		const X = Y.cross(Z).normalize();
		return new mat4(...X, 0, ...Y, 0, ...Z, 0, 0, 0, 0, 1).mult(mat4.translation(...loc.mulS(-1)));
	}

	public setValues(x: number, y: number, z: number, theta: number, phi: number, r: number): void {
		this.p[0] = x;
		this.p[1] = y;
		this.p[2] = z;
		this.theta = theta;
		this.phi = phi;
		this.r = r;
	}

	public getName() {
		return "LookAt";
	}
}

import mat2 from "./mat2"
import mat3 from "./mat3"
import vec3 from "./vec3"
import vec4 from "./vec4"
/**
 * This class represents a 4 x 4 matrix. The data is stored as an array in row major order.
	 */
export default class mat4 {
	[index: number]: number;
	0: number;
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
	6: number;
	7: number;
	8: number;
	9: number;
	10: number;
	11: number;
	12: number;
	13: number;
	14: number;
	15: number;

	/**
	 * Creates a matrix in the manner:
	 * ```
	 * a  b  c  d
	 * e  f  g  h
	 * i  j  k  l
	 * m  n  o  p
	 * ```
	 */
	constructor(a: number = 0, b: number = 0, c: number = 0, d: number = 0, e: number = 0, f: number = 0, g: number = 0, h: number = 0, i: number = 0, j: number = 0, k: number = 0, l: number = 0, m: number = 0, n: number = 0, o: number = 0, p: number = 0) {
		this[0] = a;
		this[1] = b;
		this[2] = c;
		this[3] = d;
		this[4] = e;
		this[5] = f;
		this[6] = g;
		this[7] = h;
		this[8] = i;
		this[9] = j;
		this[10] = k;
		this[11] = l;
		this[12] = m;
		this[13] = n;
		this[14] = o;
		this[15] = p;
	}

	/**
	 * Creates a matrix from vectors in the manner:
	 * ```
	 * x0  y0  z0  w0
	 * x1  y1  z1  w1
	 * x2  y2  z2  w2
	 * x3  y3  z3  w3
	 * ```
	 */
	public static fromColumnMajor(x0: number = 0, x1: number = 0, x2: number = 0, x3: number = 0, y0: number = 0, y1: number = 0, y2: number = 0, y3: number = 0, z0: number = 0, z1: number = 0, z2: number = 0, z3: number = 0, w0: number = 0, w1: number = 0, w2: number = 0, w3: number = 0): mat4 {
		return new mat4(x0, y0, z0, w0, x1, y1, z1, w1, x2, y2, z2, w2, x3, y3, z3, w3);
	}

	public static identity(): mat4 {
		return new mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	}

	public transpose(): mat4 {
		return new mat4(this[0], this[4], this[8], this[12], this[1], this[5], this[9], this[13], this[2], this[6], this[10], this[14], this[3], this[7], this[11], this[15]);
	}

	/**
	 * Swaps the given rows of this matrix.
	 * @param a the index of the row
	 * @param b the index of the row to swap with
	 */
	public swapRows(a: number, b: number): void {
		let t = 0;
		let ai = a * 4;
		let bi = b * 4;
		for (let c = 0; c < 4; c++) {
			t = this[ai];
			this[ai++] = this[bi]
			this[bi++] = t
		}
	}

	/**
	 * Calculates the inverse of the matrix using the Gauss-Jordan-Algorithm. If there are any `NaN values`, the behavior of this algorithm is undefined.
	 * @returns The inverse matrix or undefined if not inverse exists.
	 */
	public inverse(): mat4 | undefined {
		const inve: mat4 = mat4.identity();
		// 1. Swap rows if pivot is 0.
		for (let col = 0; col < 4; col++) {
			if (this[col * 4 + col] !== 0) continue;
			let candidate = -1;
			for (let row = 0; row < 4; row++) {
				if (this[row * 4 + col] !== 0 && this[col * 4 + row] !== 0) {
					candidate = row;
					break;
				}
			}
			if (candidate === -1) return undefined;
			this.swapRows(col, candidate);
			inve.swapRows(col, candidate);
		}
		// 2. forward substitution
		for (let col = 0; col < 4; col++) {
			const coli = col * 4;
			for (let row = col + 1; row < 4; row++) {
				const rowi = row * 4;
				const k = this[rowi + col] / this[coli + col];
				for (let j = 0; j < 4; j++) {
					this[rowi + j] -= k * this[coli + j];
					inve[rowi + j] -= k * this[coli + j];
				}
				this[rowi + col] = 0;
			}
		}
		// 3. scale pivot to 1
		for (let row = 0; row < 4; row++) {
			const rowi = row * 4;
			const div = this[rowi + row];
			for (let col = 0; col < 4; col++) {
				this[rowi + col] /= div;
				inve[rowi + col] /= div;
			}
		}
		// backward substitution
		for (let row = 0; row < 4; row++) {
			const rowi = row * 4;
			for (let col = row + 1; row < 4; row++) {
				const coli = col * 4;
				const k = this[rowi + col]
				for (let j = 0; j < 4; j++) {
					this[rowi + j] -= k * this[coli + j];
					inve[rowi + j] -= k * this[coli + j];
				}
				this[rowi + col] = 0;
			}
		}
		return inve;
	}

	/**
	 * Multiplies this matrix with another given matrix.
	 * @param M the matrix to multiply this matrix with.
	 * @returns The result of the matrix multiplication this * M.
	 */
	public mult(M: mat4): mat4 {
		return new mat4(this[0] * M[0] + this[1] * M[4] + this[2] * M[8] + this[3] * M[12], this[0] * M[1] + this[1] * M[5] + this[2] * M[9] + this[3] * M[13], this[0] * M[2] + this[1] * M[6] + this[2] * M[10] + this[3] * M[14], this[0] * M[3] + this[1] * M[7] + this[2] * M[11] + this[3] * M[15], this[4] * M[0] + this[5] * M[4] + this[6] * M[8] + this[7] * M[12], this[4] * M[1] + this[5] * M[5] + this[6] * M[9] + this[7] * M[13], this[4] * M[2] + this[5] * M[6] + this[6] * M[10] + this[7] * M[14], this[4] * M[3] + this[5] * M[7] + this[6] * M[11] + this[7] * M[15], this[8] * M[0] + this[9] * M[4] + this[10] * M[8] + this[11] * M[12], this[8] * M[1] + this[9] * M[5] + this[10] * M[9] + this[11] * M[13], this[8] * M[2] + this[9] * M[6] + this[10] * M[10] + this[11] * M[14], this[8] * M[3] + this[9] * M[7] + this[10] * M[11] + this[11] * M[15], this[12] * M[0] + this[13] * M[4] + this[14] * M[8] + this[15] * M[12], this[12] * M[1] + this[13] * M[5] + this[14] * M[9] + this[15] * M[13], this[12] * M[2] + this[13] * M[6] + this[14] * M[10] + this[15] * M[14], this[12] * M[3] + this[13] * M[7] + this[14] * M[11] + this[15] * M[15]);
	}

	public multVec(v: vec4): vec4 {
		return new vec4(this[0] * v[0] + this[1] * v[1] + this[2] * v[2] + this[3] * v[3], this[4] * v[0] + this[5] * v[1] + this[6] * v[2] + this[7] * v[3], this[8] * v[0] + this[9] * v[1] + this[10] * v[2] + this[11] * v[3], this[12] * v[0] + this[13] * v[1] + this[14] * v[2] + this[15] * v[3]);
	}

	/**
	 * Create a new scaling matrix from a given scaling vector.
	 * @param x The x scaling factor.
	 * @param y The y scaling factor.
	 * @param z The z scaling factor.
	 * @param w The w scaling factor.
	 */
	public static scaleation(x: number = 1, y: number = 1, z: number = 1, w: number = 1): mat4 {
		return new mat4(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, w);
	}

	/**
	 * Appends a scaling operation to the matrix by a given scaling vector.
	 * @param x The x scaling factor.
	 * @param y The y scaling factor.
	 * @param z The z scaling factor.
	 * @param w The w scaling factor.
	 */
	public scale(x: number, y: number, z: number, w: number): mat4 {
		return mat4.scaleation(x, y, z, w).mult(this);
	}

	/**
	 * Creates a new z-axis-rotation matrix from a given angle.
	 * @param a the angle to rotate in radians.
	 * @returns The new z-axis-rotation matrix.
	 */
	public static rotationZ(a: number): mat4 {
		const cosa = Math.cos(a);
		const sina = Math.sin(a);
		return new mat4(cosa, -sina, 0, 0, sina, cosa, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	}

	/**
	 * Appends a rotation operation around the z-axis by a given angle.
	 * @param a the angle to rotate in radians.
	 */
	public rotateZ(a: number): mat4 {
		return mat4.rotationZ(a).mult(this);
	}

	/**
	 * Creates a new y-axis-rotation matrix from a given angle.
	 * @param a the angle to rotate in radians.
	 * @returns The new y-axis-rotation matrix.
	 */
	public static rotationY(a: number): mat4 {
		const cosa = Math.cos(a);
		const sina = Math.sin(a);
		return new mat4(cosa, 0, sina, 0, 0, 1, 0, 0, -sina, 0, cosa, 0, 0, 0, 0, 1);
	}

	/**
	 * Rotates the matrix around the y-axis by a given angle.
	 * @param a the angle to rotate in radians.
	 */
	public rotateY(a: number): mat4 {
		return mat4.rotationY(a).mult(this);
	}

	/**
	 * Creates a new x-axis-rotation matrix from a given angle.
	 * @param a the angle to rotate in radians.
	 * @returns The new x-axis-rotation matrix.
	 */
	public static rotationX(a: number): mat4 {
		const cosa = Math.cos(a);
		const sina = Math.sin(a);
		return new mat4(1, 0, 0, 0, 0, cosa, -sina, 0, 0, sina, cosa, 0, 0, 0, 0, 1);
	}

	/**
	 * Rotates the matrix around the x-axis by a given angle.
	 * @param a the angle to rotate in radians.
	 */
	public rotateX(a: number): mat4 {
		return mat4.rotationX(a).mult(this);
	}

	/**
	 * Performs transformation by using homogeneous coordinates. Homogenization is performed with a given constant and the result is dehomogenized after multiplication.
	 * @param v The vector to perform the homogeneous transformation on.
	 * @param h The homogeneous augmentation number.
	 */
	public multiplyHomogeneous(v: vec3, h: number = 1): vec3 {
		const vec: vec4 = this.multVec(new vec4(v.x, v.y, v.z, h));
		const u = vec[3];
		if (u === 1) return vec.xyz;
		return new vec3(vec[0] / u, vec[1] / u, vec[2] / u);
	}

	/**
	 * Create a new translation matrix from a given translation vector.
	 * @param x The x translation.
	 * @param y The y translation.
	 * @param z The z translation.
	 */
	public static translation(x: number = 0, y: number = 0, z: number = 0): mat4 {
		return new mat4(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
	}

	/**
	 * Appends a translation operation to the matrix by a given scaling vector.
	 * @param mat The matrix to translate.
	 * @param x The x translation.
	 * @param y The y translation.
	 * @param z The z translation.
	 */
	public translate(x: number = 0, y: number = 0, z: number = 0): mat4 {
		return mat4.translation(x, y, z).mult(this);
	}

	/**
	 * Gets the Translation part of the matrix.
	 */
	public getTranslation(): vec3 {
		return new vec3(this[3], this[7], this[11]);
	}

	/**
	 * Creates a WebGPU perspective projection matrix form the given parameters. Target z range: [0, 1].
	 * @param r The right edge of the near clipping plane.
	 * @param l The left edge of the near clipping plane.
	 * @param t The top edge of the near clipping plane.
	 * @param b the bottom edge of the near clipping plane.
	 * @param n The distance of the near clipping plane.
	 * @param f The distance to the far clipping plane.
	 */
	public static perspective(r: number = 0.1, l: number = -0.1, t: number = 0.1, b: number = -0.1, n: number = 0.1, f: number = 1000): mat4 {
		const n2 = 2 * n;
		const rml = r - l;
		const tmb = t - b;
		const fmn = f - n;
		return new mat4(
			n2 / rml, 0, (r + l) / rml, 0,
			0, n2 / tmb, (t + b) / tmb, 0,
			0, 0, -(f) / fmn, -n * f / fmn,
			0, 0, -1, 0);
	}

	/**
	 * Creates a WebGPU orthographic projection matrix from the given parameters. Target z range: [0, 1].
	 * @param r The right edge of the near clipping plane.
	 * @param l The left edge of the near clipping plane.
	 * @param t The top edge of the near clipping plane.
	 * @param b the bottom edge of the near clipping plane.
	 * @param n The distance of the near clipping plane.
	 * @param f The distance to the far clipping plane.
	 */
	public static orthographic(r: number = 1, l: number = -1, t: number = 1, b: number = -1, n: number = 0, f: number = 1000): mat4 {
		const rml = r - l;
		const tmb = t - b;
		const fmn = f - n;
		return new mat4(2 / rml, 0, 0, -(r + l) / rml, 0, 2 / tmb, 0, -(t + b) / tmb, 0, 0, -1 / fmn, -(n) / fmn, 0, 0, 0, 1);
	}

	/**
	 * Claps the matrix to a 2x2 matrix by discarding the rows and columns beyond 2.
	 */
	public toMat2(): mat2 {
		return new mat2(this[0], this[1], this[4], this[5]);
	}

	/**
	 * Claps the matrix to a 3x3 matrix by discarding the rows and columns beyond 3.
	 */
	public toMat3(): mat3 {
		return new mat3(this[0], this[1], this[2], this[4], this[5], this[6], this[8], this[9], this[10]);
	}

	/**
	 * Pushes the values of this matrix in the given array in row major layout.
	 */
	public pushInArrayRowMajor(arr: number[]): void {
		arr.push(this[0], this[1], this[2], this[3], this[4], this[5], this[6], this[7], this[8], this[9], this[10], this[11], this[12], this[13], this[14], this[15]);
	}

	/**
	 * Pushes the values of this matrix in the given Float32Array at the specified index in row major layout.
	 * @param arr The array to push into.
	 * @param startIndex The index where to start the insertion.
	 */
	public pushInFloat32ArrayRowMajor(arr: Float32Array, startIndex: number = 0): void {
		arr[startIndex] = this[0];
		arr[startIndex + 1] = this[1];
		arr[startIndex + 2] = this[2];
		arr[startIndex + 3] = this[3];
		arr[startIndex + 4] = this[4];
		arr[startIndex + 5] = this[5];
		arr[startIndex + 6] = this[6];
		arr[startIndex + 7] = this[7];
		arr[startIndex + 8] = this[8];
		arr[startIndex + 9] = this[9];
		arr[startIndex + 10] = this[10];
		arr[startIndex + 11] = this[11];
		arr[startIndex + 12] = this[12];
		arr[startIndex + 13] = this[13];
		arr[startIndex + 14] = this[14];
		arr[startIndex + 15] = this[15];
	}

	/**
	 * Pushes the values of this matrix in the given array in column major layout.
	 */
	public pushInArrayColumnMajor(arr: number[]): void {
		arr.push(this[0], this[4], this[8], this[12], this[1], this[5], this[9], this[13], this[2], this[6], this[10], this[14], this[3], this[7], this[11], this[15]);
	}

	/**
	 * Pushes the values of this matrix in the given Float32Array at the specified index in column major layout.
	 * @param arr The array to push into.
	 * @param startIndex The index where to start the insertion.
	 */
	public pushInFloat32ArrayColumnMajor(arr: Float32Array, startIndex: number = 0): void {
		arr[startIndex] = this[0];
		arr[startIndex + 1] = this[4];
		arr[startIndex + 2] = this[8];
		arr[startIndex + 3] = this[12];
		arr[startIndex + 4] = this[1];
		arr[startIndex + 5] = this[5];
		arr[startIndex + 6] = this[9];
		arr[startIndex + 7] = this[13];
		arr[startIndex + 8] = this[2];
		arr[startIndex + 9] = this[6];
		arr[startIndex + 10] = this[10];
		arr[startIndex + 11] = this[14];
		arr[startIndex + 12] = this[3];
		arr[startIndex + 13] = this[7];
		arr[startIndex + 14] = this[11];
		arr[startIndex + 15] = this[15];
	}

}

import mat2 from "./mat2"
import mat4 from "./mat4"
import vec2 from "./vec2"
import vec3 from "./vec3"
/**
 * This class represents a 3 x 3 matrix. The data is stored as an array in row major order.
	 */
export default class mat3 {
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

	/**
	 * Creates a matrix in the manner:
	 * ```
	 * a  b  c
	 * d  e  f
	 * g  h  i
	 * ```
	 */
	constructor(a: number = 0, b: number = 0, c: number = 0, d: number = 0, e: number = 0, f: number = 0, g: number = 0, h: number = 0, i: number = 0) {
		this[0] = a;
		this[1] = b;
		this[2] = c;
		this[3] = d;
		this[4] = e;
		this[5] = f;
		this[6] = g;
		this[7] = h;
		this[8] = i;
	}

	/**
	 * Creates a matrix from vectors in the manner:
	 * ```
	 * x0  y0  z0
	 * x1  y1  z1
	 * x2  y2  z2
	 * ```
	 */
	public static fromColumnMajor(x0: number = 0, x1: number = 0, x2: number = 0, y0: number = 0, y1: number = 0, y2: number = 0, z0: number = 0, z1: number = 0, z2: number = 0): mat3 {
		return new mat3(x0, y0, z0, x1, y1, z1, x2, y2, z2);
	}

	public static identity(): mat3 {
		return new mat3(1, 0, 0, 0, 1, 0, 0, 0, 1);
	}

	public transpose(): mat3 {
		return new mat3(this[0], this[3], this[6], this[1], this[4], this[7], this[2], this[5], this[8]);
	}

	/**
	 * Swaps the given rows of this matrix.
	 * @param a the index of the row
	 * @param b the index of the row to swap with
	 */
	public swapRows(a: number, b: number): void {
		let t = 0;
		let ai = a * 3;
		let bi = b * 3;
		for (let c = 0; c < 3; c++) {
			t = this[ai];
			this[ai++] = this[bi]
			this[bi++] = t
		}
	}

	/**
	 * Calculates the inverse of the matrix using the Gauss-Jordan-Algorithm. If there are any `NaN values`, the behavior of this algorithm is undefined.
	 * @returns The inverse matrix or undefined if not inverse exists.
	 */
	public inverse(): mat3 | undefined {
		const inve: mat3 = mat3.identity();
		// 1. Swap rows if pivot is 0.
		for (let col = 0; col < 3; col++) {
			if (this[col * 3 + col] !== 0) continue;
			let candidate = -1;
			for (let row = 0; row < 3; row++) {
				if (this[row * 3 + col] !== 0 && this[col * 4 + row] !== 0) {
					candidate = row;
					break;
				}
			}
			if (candidate === -1) return undefined;
			this.swapRows(col, candidate);
			inve.swapRows(col, candidate);
		}
		// 2. forward substitution
		for (let col = 0; col < 3; col++) {
			const coli = col * 3;
			for (let row = col + 1; row < 3; row++) {
				const rowi = row * 3;
				const k = this[rowi + col] / this[coli + col];
				for (let j = 0; j < 3; j++) {
					this[rowi + j] -= k * this[coli + j];
					inve[rowi + j] -= k * this[coli + j];
				}
				this[rowi + col] = 0;
			}
		}
		// 3. scale pivot to 1
		for (let row = 0; row < 3; row++) {
			const rowi = row * 3;
			const div = this[rowi + row];
			for (let col = 0; col < 3; col++) {
				this[rowi + col] /= div;
				inve[rowi + col] /= div;
			}
		}
		// backward substitution
		for (let row = 0; row < 3; row++) {
			const rowi = row * 3;
			for (let col = row + 1; row < 3; row++) {
				const coli = col * 3;
				const k = this[rowi + col]
				for (let j = 0; j < 3; j++) {
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
	public mult(M: mat3): mat3 {
		return new mat3(this[0] * M[0] + this[1] * M[3] + this[2] * M[6], this[0] * M[1] + this[1] * M[4] + this[2] * M[7], this[0] * M[2] + this[1] * M[5] + this[2] * M[8], this[3] * M[0] + this[4] * M[3] + this[5] * M[6], this[3] * M[1] + this[4] * M[4] + this[5] * M[7], this[3] * M[2] + this[4] * M[5] + this[5] * M[8], this[6] * M[0] + this[7] * M[3] + this[8] * M[6], this[6] * M[1] + this[7] * M[4] + this[8] * M[7], this[6] * M[2] + this[7] * M[5] + this[8] * M[8]);
	}

	public multVec(v: vec3): vec3 {
		return new vec3(this[0] * v[0] + this[1] * v[1] + this[2] * v[2], this[3] * v[0] + this[4] * v[1] + this[5] * v[2], this[6] * v[0] + this[7] * v[1] + this[8] * v[2]);
	}

	/**
	 * Create a new scaling matrix from a given scaling vector.
	 * @param x The x scaling factor.
	 * @param y The y scaling factor.
	 * @param z The z scaling factor.
	 */
	public static scaleation(x: number = 1, y: number = 1, z: number = 1): mat3 {
		return new mat3(x, 0, 0, 0, y, 0, 0, 0, z);
	}

	/**
	 * Appends a scaling operation to the matrix by a given scaling vector.
	 * @param x The x scaling factor.
	 * @param y The y scaling factor.
	 * @param z The z scaling factor.
	 */
	public scale(x: number, y: number, z: number): mat3 {
		return mat3.scaleation(x, y, z).mult(this);
	}

	/**
	 * Creates a new z-axis-rotation matrix from a given angle.
	 * @param a the angle to rotate in radians.
	 * @returns The new z-axis-rotation matrix.
	 */
	public static rotationZ(a: number): mat3 {
		const cosa = Math.cos(a);
		const sina = Math.sin(a);
		return new mat3(cosa, -sina, 0, sina, cosa, 0, 0, 0, 1);
	}

	/**
	 * Appends a rotation operation around the z-axis by a given angle.
	 * @param a the angle to rotate in radians.
	 */
	public rotateZ(a: number): mat3 {
		return mat3.rotationZ(a).mult(this);
	}

	/**
	 * Creates a new y-axis-rotation matrix from a given angle.
	 * @param a the angle to rotate in radians.
	 * @returns The new y-axis-rotation matrix.
	 */
	public static rotationY(a: number): mat3 {
		const cosa = Math.cos(a);
		const sina = Math.sin(a);
		return new mat3(cosa, 0, sina, 0, 1, 0, -sina, 0, cosa);
	}

	/**
	 * Rotates the matrix around the y-axis by a given angle.
	 * @param a the angle to rotate in radians.
	 */
	public rotateY(a: number): mat3 {
		return mat3.rotationY(a).mult(this);
	}

	/**
	 * Creates a new x-axis-rotation matrix from a given angle.
	 * @param a the angle to rotate in radians.
	 * @returns The new x-axis-rotation matrix.
	 */
	public static rotationX(a: number): mat3 {
		const cosa = Math.cos(a);
		const sina = Math.sin(a);
		return new mat3(1, 0, 0, 0, cosa, -sina, 0, sina, cosa);
	}

	/**
	 * Rotates the matrix around the x-axis by a given angle.
	 * @param a the angle to rotate in radians.
	 */
	public rotateX(a: number): mat3 {
		return mat3.rotationX(a).mult(this);
	}

	/**
	 * Performs transformation by using homogeneous coordinates. Homogenization is performed with a given constant and the result is dehomogenized after multiplication.
	 * @param v The vector to perform the homogeneous transformation on.
	 * @param h The homogeneous augmentation number.
	 */
	public multiplyHomogeneous(v: vec2, h: number = 1): vec2 {
		const vec: vec3 = this.multVec(new vec3(v.x, v.y, h));
		const u = vec[2];
		if (u === 1) return vec.xy;
		return new vec2(vec[0] / u, vec[1] / u);
	}

	/**
	 * Create a new translation matrix from a given translation vector.
	 * @param x The x translation.
	 * @param y The y translation.
	 */
	public static translation(x: number = 0, y: number = 0): mat3 {
		return new mat3(1, 0, x, 0, 1, y, 0, 0, 1);
	}

	/**
	 * Appends a translation operation to the matrix by a given scaling vector.
	 * @param mat The matrix to translate.
	 * @param x The x translation.
	 * @param y The y translation.
	 */
	public translate(x: number = 0, y: number = 0): mat3 {
		return mat3.translation(x, y).mult(this);
	}

	/**
	 * Gets the Translation part of the matrix.
	 */
	public getTranslation(): vec2 {
		return new vec2(this[2], this[5]);
	}

	/**
	 * Claps the matrix to a 2x2 matrix by discarding the rows and columns beyond 2.
	 */
	public toMat2(): mat2 {
		return new mat2(this[0], this[1], this[3], this[4]);
	}

	/**
	 * Expands the matrix to a 4x4 matrix by placing 1 in the augmented diagonal position and 0 else.
	 */
	public toMat4(): mat4 {
		return new mat4(this[0], this[1], this[2], 0, this[3], this[4], this[5], 0, this[6], this[7], this[8], 0, 0, 0, 0, 1);
	}

	/**
	 * Pushes the values of this matrix in the given array in row major layout.
	 */
	public pushInArrayRowMajor(arr: number[]): void {
		arr.push(this[0], this[1], this[2], this[3], this[4], this[5], this[6], this[7], this[8]);
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
	}

	/**
	 * Pushes the values of this matrix in the given array in column major layout.
	 */
	public pushInArrayColumnMajor(arr: number[]): void {
		arr.push(this[0], this[3], this[6], this[1], this[4], this[7], this[2], this[5], this[8]);
	}

	/**
	 * Pushes the values of this matrix in the given Float32Array at the specified index in column major layout.
	 * @param arr The array to push into.
	 * @param startIndex The index where to start the insertion.
	 */
	public pushInFloat32ArrayColumnMajor(arr: Float32Array, startIndex: number = 0): void {
		arr[startIndex] = this[0];
		arr[startIndex + 1] = this[3];
		arr[startIndex + 2] = this[6];
		arr[startIndex + 3] = this[1];
		arr[startIndex + 4] = this[4];
		arr[startIndex + 5] = this[7];
		arr[startIndex + 6] = this[2];
		arr[startIndex + 7] = this[5];
		arr[startIndex + 8] = this[8];
	}

}

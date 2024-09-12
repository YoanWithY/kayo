import mat3 from "./mat3"
import mat4 from "./mat4"
import vec2 from "./vec2"
/**
 * This class represents a 2 x 2 matrix. The data is stored as an array in row major order.
	 */
export default class mat2 {
	[index: number]: number;
	0: number;
	1: number;
	2: number;
	3: number;

	/**
	 * Creates a matrix in the manner:
	 * ```
	 * a  b
	 * c  d
	 * ```
	 */
	constructor(a: number = 0, b: number = 0, c: number = 0, d: number = 0) {
		this[0] = a;
		this[1] = b;
		this[2] = c;
		this[3] = d;
	}

	/**
	 * Creates a matrix from vectors in the manner:
	 * ```
	 * x0  y0
	 * x1  y1
	 * ```
	 */
	public static fromColumnMajor(x0: number = 0, x1: number = 0, y0: number = 0, y1: number = 0): mat2 {
		return new mat2(x0, y0, x1, y1);
	}

	public static identity(): mat2 {
		return new mat2(1, 0, 0, 1);
	}

	public transpose(): mat2 {
		return new mat2(this[0], this[2], this[1], this[3]);
	}

	/**
	 * Swaps the given rows of this matrix.
	 * @param a the index of the row
	 * @param b the index of the row to swap with
	 */
	public swapRows(a: number, b: number): void {
		let t = 0;
		let ai = a * 2;
		let bi = b * 2;
		for (let c = 0; c < 2; c++) {
			t = this[ai];
			this[ai++] = this[bi]
			this[bi++] = t
		}
	}

	/**
	 * Calculates the inverse of the matrix using the Gauss-Jordan-Algorithm. If there are any `NaN values`, the behavior of this algorithm is undefined.
	 * @returns The inverse matrix or undefined if not inverse exists.
	 */
	public inverse(): mat2 | undefined {
		const inve: mat2 = mat2.identity();
		// 1. Swap rows if pivot is 0.
		for (let col = 0; col < 2; col++) {
			if (this[col * 2 + col] !== 0) continue;
			let candidate = -1;
			for (let row = 0; row < 2; row++) {
				if (this[row * 2 + col] !== 0 && this[col * 4 + row] !== 0) {
					candidate = row;
					break;
				}
			}
			if (candidate === -1) return undefined;
			this.swapRows(col, candidate);
			inve.swapRows(col, candidate);
		}
		// 2. forward substitution
		for (let col = 0; col < 2; col++) {
			const coli = col * 2;
			for (let row = col + 1; row < 2; row++) {
				const rowi = row * 2;
				const k = this[rowi + col] / this[coli + col];
				for (let j = 0; j < 2; j++) {
					this[rowi + j] -= k * this[coli + j];
					inve[rowi + j] -= k * this[coli + j];
				}
				this[rowi + col] = 0;
			}
		}
		// 3. scale pivot to 1
		for (let row = 0; row < 2; row++) {
			const rowi = row * 2;
			const div = this[rowi + row];
			for (let col = 0; col < 2; col++) {
				this[rowi + col] /= div;
				inve[rowi + col] /= div;
			}
		}
		// backward substitution
		for (let row = 0; row < 2; row++) {
			const rowi = row * 2;
			for (let col = row + 1; row < 2; row++) {
				const coli = col * 2;
				const k = this[rowi + col]
				for (let j = 0; j < 2; j++) {
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
	public mult(M: mat2): mat2 {
		return new mat2(this[0] * M[0] + this[1] * M[2], this[0] * M[1] + this[1] * M[3], this[2] * M[0] + this[3] * M[2], this[2] * M[1] + this[3] * M[3]);
	}

	public multVec(v: vec2): vec2 {
		return new vec2(this[0] * v[0] + this[1] * v[1], this[2] * v[0] + this[3] * v[1]);
	}

	/**
	 * Create a new scaling matrix from a given scaling vector.
	 * @param x The x scaling factor.
	 * @param y The y scaling factor.
	 */
	public static scaleation(x: number = 1, y: number = 1): mat2 {
		return new mat2(x, 0, 0, y);
	}

	/**
	 * Appends a scaling operation to the matrix by a given scaling vector.
	 * @param x The x scaling factor.
	 * @param y The y scaling factor.
	 */
	public scale(x: number, y: number): mat2 {
		return mat2.scaleation(x, y).mult(this);
	}

	/**
	 * Creates a new z-axis-rotation matrix from a given angle.
	 * @param a the angle to rotate in radians.
	 * @returns The new z-axis-rotation matrix.
	 */
	public static rotationZ(a: number): mat2 {
		const cosa = Math.cos(a);
		const sina = Math.sin(a);
		return new mat2(cosa, -sina, sina, cosa);
	}

	/**
	 * Appends a rotation operation around the z-axis by a given angle.
	 * @param a the angle to rotate in radians.
	 */
	public rotateZ(a: number): mat2 {
		return mat2.rotationZ(a).mult(this);
	}

	/**
	 * Expands the matrix to a 3x3 matrix by placing 1 in the augmented diagonal position and 0 else.
	 */
	public toMat3(): mat3 {
		return new mat3(this[0], this[1], 0, this[2], this[3], 0, 0, 0, 1);
	}

	/**
	 * Expands the matrix to a 4x4 matrix by placing 1 in the augmented diagonal position and 0 else.
	 */
	public toMat4(): mat4 {
		return new mat4(this[0], this[1], 0, 0, this[2], this[3], 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
	}

	/**
	 * Pushes the values of this matrix in the given array in row major layout.
	 */
	public pushInArrayRowMajor(arr: number[]): void {
		arr.push(this[0], this[1], this[2], this[3]);
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
	}

	/**
	 * Pushes the values of this matrix in the given array in column major layout.
	 */
	public pushInArrayColumnMajor(arr: number[]): void {
		arr.push(this[0], this[2], this[1], this[3]);
	}

	/**
	 * Pushes the values of this matrix in the given Float32Array at the specified index in column major layout.
	 * @param arr The array to push into.
	 * @param startIndex The index where to start the insertion.
	 */
	public pushInFloat32ArrayColumnMajor(arr: Float32Array, startIndex: number = 0): void {
		arr[startIndex] = this[0];
		arr[startIndex + 1] = this[2];
		arr[startIndex + 2] = this[1];
		arr[startIndex + 3] = this[3];
	}

}

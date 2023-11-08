import vec from "./vec"
import vec2 from "./vec2"
import vec3 from "./vec3"
export default class vec4 implements vec<vec4> {
	[n: number]: number;
	0: number;
	1: number;
	2: number;
	3: number;

	*[Symbol.iterator](): IterableIterator<number> {
		yield this[0];
		yield this[1];
		yield this[2];
		yield this[3];
	}

	/**
	 * Constructor for a vec4.
	 * @param x x-component of the new vector.
	 * @param y y-component of the new vector.
	 * @param z z-component of the new vector.
	 * @param w w-component of the new vector.
	 */
	constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
		this[0] = x;
		this[1] = y;
		this[2] = z;
		this[3] = w;
	}

	/**
	 * The 4-dimensional null-vector.
	 * @returns A new vector representing the null vector.
	 */
	static get NULL(): vec4 {
		return new vec4(0, 0, 0, 0);
	}

	/**
	 * The 4-dimensional x-axis vector.
	 * @returns A new 4-dimensional x-axis vector.
	 */
	public static get X(): vec4 {
		return new vec4(1, 0, 0, 0);
	}

	/**
	 * The 4-dimensional y-axis vector.
	 * @returns A new 4-dimensional y-axis vector.
	 */
	public static get Y(): vec4 {
		return new vec4(0, 1, 0, 0);
	}

	/**
	 * The 4-dimensional z-axis vector.
	 * @returns A new 4-dimensional z-axis vector.
	 */
	public static get Z(): vec4 {
		return new vec4(0, 0, 1, 0);
	}

	/**
	 * The 4-dimensional w-axis vector.
	 * @returns A new 4-dimensional w-axis vector.
	 */
	public static get W(): vec4 {
		return new vec4(0, 0, 0, 1);
	}

	public add(v: vec4): vec4 {
		return new vec4(this[0] + v[0], this[1] + v[1], this[2] + v[2], this[3] + v[3]);
	}

	public addS(f: number): vec4 {
		return new vec4(this[0] + f, this[1] + f, this[2] + f, this[3] + f);
	}

	public sub(v: vec4): vec4 {
		return new vec4(this[0] - v[0], this[1] - v[1], this[2] - v[2], this[3] - v[3]);
	}

	public subS(f: number): vec4 {
		return new vec4(this[0] - f, this[1] - f, this[2] - f, this[3] - f);
	}

	public mul(v: vec4): vec4 {
		return new vec4(this[0] * v[0], this[1] * v[1], this[2] * v[2], this[3] * v[3]);
	}

	public mulS(f: number): vec4 {
		return new vec4(this[0] * f, this[1] * f, this[2] * f, this[3] * f);
	}

	public div(v: vec4): vec4 {
		return new vec4(this[0] / v[0], this[1] / v[1], this[2] / v[2], this[3] / v[3]);
	}

	public divS(f: number): vec4 {
		return new vec4(this[0] / f, this[1] / f, this[2] / f, this[3] / f);
	}

	public rest(v: vec4): vec4 {
		return new vec4(this[0] % v[0], this[1] % v[1], this[2] % v[2], this[3] % v[3]);
	}

	public restS(f: number): vec4 {
		return new vec4(this[0] % f, this[1] % f, this[2] % f, this[3] % f);
	}

	public pow(v: vec4): vec4 {
		return new vec4(this[0] ** v[0], this[1] ** v[1], this[2] ** v[2], this[3] ** v[3]);
	}

	public powS(f: number): vec4 {
		return new vec4(this[0] ** f, this[1] ** f, this[2] ** f, this[3] ** f);
	}

	public dot(v: vec4): number {
		return this[0] * v[0] + this[1] * v[1] + this[2] * v[2] + this[3] * v[3];
	}

	public norm(): number {
		return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3]);
	}

	public normalize(): vec4 {
		const l = 1 / Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3]);
		return new vec4(this[0] * l, this[1] * l, this[2] * l, this[3] * l);
	}

	public distance(v: vec4): number {
		return v.sub(this).norm();
	}

	public static distance(x1: number, y1: number, z1: number, w1: number, x2: number, y2: number, z2: number, w2: number): number {
		const d0 = x2 - x1;
		const d1 = y2 - y1;
		const d2 = z2 - z1;
		const d3 = w2 - w1;
		return Math.sqrt(d0 * d0 + d1 * d1 + d2 * d2 + d3 * d3);
	}

	public static sum(...v: vec4[]): vec4 {
		let x = 0, y = 0, z = 0, w = 0;
		for (const vec of v) {
			x += vec[0];
			y += vec[1];
			z += vec[2];
			w += vec[3];
		}
		return new vec4(x, y, z, w);
	}

	public static average(...v: vec4[]): vec4 {
		return vec4.sum(...v).divS(v.length);
	}

	/**
	 * Pushes the values of this vector in the given array.
	 */
	public pushInArray(arr: number[]): void {
		arr.push(this[0], this[1], this[2], this[3]);
	}

	/**
	 * Pushes the values of this vector in the given Float32Array at the specified index.
	 * @param arr The array to push into.
	 * @param startIndex The index where to start the insertion.
	 */
	public pushInFloat32Array(arr: Float32Array, startIndex: number = 0): void {
		arr[startIndex] = this[0];
		arr[startIndex + 1] = this[1];
		arr[startIndex + 2] = this[2];
		arr[startIndex + 3] = this[3];
	}

	get x(): number {
		return this[0];
	}

	get y(): number {
		return this[1];
	}

	get z(): number {
		return this[2];
	}

	get w(): number {
		return this[3];
	}

	get xx(): vec2 {
		return new vec2(this[0], this[0]);
	}

	get xy(): vec2 {
		return new vec2(this[0], this[1]);
	}

	get xz(): vec2 {
		return new vec2(this[0], this[2]);
	}

	get xw(): vec2 {
		return new vec2(this[0], this[3]);
	}

	get yx(): vec2 {
		return new vec2(this[1], this[0]);
	}

	get yy(): vec2 {
		return new vec2(this[1], this[1]);
	}

	get yz(): vec2 {
		return new vec2(this[1], this[2]);
	}

	get yw(): vec2 {
		return new vec2(this[1], this[3]);
	}

	get zx(): vec2 {
		return new vec2(this[2], this[0]);
	}

	get zy(): vec2 {
		return new vec2(this[2], this[1]);
	}

	get zz(): vec2 {
		return new vec2(this[2], this[2]);
	}

	get zw(): vec2 {
		return new vec2(this[2], this[3]);
	}

	get wx(): vec2 {
		return new vec2(this[3], this[0]);
	}

	get wy(): vec2 {
		return new vec2(this[3], this[1]);
	}

	get wz(): vec2 {
		return new vec2(this[3], this[2]);
	}

	get ww(): vec2 {
		return new vec2(this[3], this[3]);
	}

	get xxx(): vec3 {
		return new vec3(this[0], this[0], this[0]);
	}

	get xxy(): vec3 {
		return new vec3(this[0], this[0], this[1]);
	}

	get xxz(): vec3 {
		return new vec3(this[0], this[0], this[2]);
	}

	get xxw(): vec3 {
		return new vec3(this[0], this[0], this[3]);
	}

	get xyx(): vec3 {
		return new vec3(this[0], this[1], this[0]);
	}

	get xyy(): vec3 {
		return new vec3(this[0], this[1], this[1]);
	}

	get xyz(): vec3 {
		return new vec3(this[0], this[1], this[2]);
	}

	get xyw(): vec3 {
		return new vec3(this[0], this[1], this[3]);
	}

	get xzx(): vec3 {
		return new vec3(this[0], this[2], this[0]);
	}

	get xzy(): vec3 {
		return new vec3(this[0], this[2], this[1]);
	}

	get xzz(): vec3 {
		return new vec3(this[0], this[2], this[2]);
	}

	get xzw(): vec3 {
		return new vec3(this[0], this[2], this[3]);
	}

	get xwx(): vec3 {
		return new vec3(this[0], this[3], this[0]);
	}

	get xwy(): vec3 {
		return new vec3(this[0], this[3], this[1]);
	}

	get xwz(): vec3 {
		return new vec3(this[0], this[3], this[2]);
	}

	get xww(): vec3 {
		return new vec3(this[0], this[3], this[3]);
	}

	get yxx(): vec3 {
		return new vec3(this[1], this[0], this[0]);
	}

	get yxy(): vec3 {
		return new vec3(this[1], this[0], this[1]);
	}

	get yxz(): vec3 {
		return new vec3(this[1], this[0], this[2]);
	}

	get yxw(): vec3 {
		return new vec3(this[1], this[0], this[3]);
	}

	get yyx(): vec3 {
		return new vec3(this[1], this[1], this[0]);
	}

	get yyy(): vec3 {
		return new vec3(this[1], this[1], this[1]);
	}

	get yyz(): vec3 {
		return new vec3(this[1], this[1], this[2]);
	}

	get yyw(): vec3 {
		return new vec3(this[1], this[1], this[3]);
	}

	get yzx(): vec3 {
		return new vec3(this[1], this[2], this[0]);
	}

	get yzy(): vec3 {
		return new vec3(this[1], this[2], this[1]);
	}

	get yzz(): vec3 {
		return new vec3(this[1], this[2], this[2]);
	}

	get yzw(): vec3 {
		return new vec3(this[1], this[2], this[3]);
	}

	get ywx(): vec3 {
		return new vec3(this[1], this[3], this[0]);
	}

	get ywy(): vec3 {
		return new vec3(this[1], this[3], this[1]);
	}

	get ywz(): vec3 {
		return new vec3(this[1], this[3], this[2]);
	}

	get yww(): vec3 {
		return new vec3(this[1], this[3], this[3]);
	}

	get zxx(): vec3 {
		return new vec3(this[2], this[0], this[0]);
	}

	get zxy(): vec3 {
		return new vec3(this[2], this[0], this[1]);
	}

	get zxz(): vec3 {
		return new vec3(this[2], this[0], this[2]);
	}

	get zxw(): vec3 {
		return new vec3(this[2], this[0], this[3]);
	}

	get zyx(): vec3 {
		return new vec3(this[2], this[1], this[0]);
	}

	get zyy(): vec3 {
		return new vec3(this[2], this[1], this[1]);
	}

	get zyz(): vec3 {
		return new vec3(this[2], this[1], this[2]);
	}

	get zyw(): vec3 {
		return new vec3(this[2], this[1], this[3]);
	}

	get zzx(): vec3 {
		return new vec3(this[2], this[2], this[0]);
	}

	get zzy(): vec3 {
		return new vec3(this[2], this[2], this[1]);
	}

	get zzz(): vec3 {
		return new vec3(this[2], this[2], this[2]);
	}

	get zzw(): vec3 {
		return new vec3(this[2], this[2], this[3]);
	}

	get zwx(): vec3 {
		return new vec3(this[2], this[3], this[0]);
	}

	get zwy(): vec3 {
		return new vec3(this[2], this[3], this[1]);
	}

	get zwz(): vec3 {
		return new vec3(this[2], this[3], this[2]);
	}

	get zww(): vec3 {
		return new vec3(this[2], this[3], this[3]);
	}

	get wxx(): vec3 {
		return new vec3(this[3], this[0], this[0]);
	}

	get wxy(): vec3 {
		return new vec3(this[3], this[0], this[1]);
	}

	get wxz(): vec3 {
		return new vec3(this[3], this[0], this[2]);
	}

	get wxw(): vec3 {
		return new vec3(this[3], this[0], this[3]);
	}

	get wyx(): vec3 {
		return new vec3(this[3], this[1], this[0]);
	}

	get wyy(): vec3 {
		return new vec3(this[3], this[1], this[1]);
	}

	get wyz(): vec3 {
		return new vec3(this[3], this[1], this[2]);
	}

	get wyw(): vec3 {
		return new vec3(this[3], this[1], this[3]);
	}

	get wzx(): vec3 {
		return new vec3(this[3], this[2], this[0]);
	}

	get wzy(): vec3 {
		return new vec3(this[3], this[2], this[1]);
	}

	get wzz(): vec3 {
		return new vec3(this[3], this[2], this[2]);
	}

	get wzw(): vec3 {
		return new vec3(this[3], this[2], this[3]);
	}

	get wwx(): vec3 {
		return new vec3(this[3], this[3], this[0]);
	}

	get wwy(): vec3 {
		return new vec3(this[3], this[3], this[1]);
	}

	get wwz(): vec3 {
		return new vec3(this[3], this[3], this[2]);
	}

	get www(): vec3 {
		return new vec3(this[3], this[3], this[3]);
	}

	get xxxx(): vec4 {
		return new vec4(this[0], this[0], this[0], this[0]);
	}

	get xxxy(): vec4 {
		return new vec4(this[0], this[0], this[0], this[1]);
	}

	get xxxz(): vec4 {
		return new vec4(this[0], this[0], this[0], this[2]);
	}

	get xxxw(): vec4 {
		return new vec4(this[0], this[0], this[0], this[3]);
	}

	get xxyx(): vec4 {
		return new vec4(this[0], this[0], this[1], this[0]);
	}

	get xxyy(): vec4 {
		return new vec4(this[0], this[0], this[1], this[1]);
	}

	get xxyz(): vec4 {
		return new vec4(this[0], this[0], this[1], this[2]);
	}

	get xxyw(): vec4 {
		return new vec4(this[0], this[0], this[1], this[3]);
	}

	get xxzx(): vec4 {
		return new vec4(this[0], this[0], this[2], this[0]);
	}

	get xxzy(): vec4 {
		return new vec4(this[0], this[0], this[2], this[1]);
	}

	get xxzz(): vec4 {
		return new vec4(this[0], this[0], this[2], this[2]);
	}

	get xxzw(): vec4 {
		return new vec4(this[0], this[0], this[2], this[3]);
	}

	get xxwx(): vec4 {
		return new vec4(this[0], this[0], this[3], this[0]);
	}

	get xxwy(): vec4 {
		return new vec4(this[0], this[0], this[3], this[1]);
	}

	get xxwz(): vec4 {
		return new vec4(this[0], this[0], this[3], this[2]);
	}

	get xxww(): vec4 {
		return new vec4(this[0], this[0], this[3], this[3]);
	}

	get xyxx(): vec4 {
		return new vec4(this[0], this[1], this[0], this[0]);
	}

	get xyxy(): vec4 {
		return new vec4(this[0], this[1], this[0], this[1]);
	}

	get xyxz(): vec4 {
		return new vec4(this[0], this[1], this[0], this[2]);
	}

	get xyxw(): vec4 {
		return new vec4(this[0], this[1], this[0], this[3]);
	}

	get xyyx(): vec4 {
		return new vec4(this[0], this[1], this[1], this[0]);
	}

	get xyyy(): vec4 {
		return new vec4(this[0], this[1], this[1], this[1]);
	}

	get xyyz(): vec4 {
		return new vec4(this[0], this[1], this[1], this[2]);
	}

	get xyyw(): vec4 {
		return new vec4(this[0], this[1], this[1], this[3]);
	}

	get xyzx(): vec4 {
		return new vec4(this[0], this[1], this[2], this[0]);
	}

	get xyzy(): vec4 {
		return new vec4(this[0], this[1], this[2], this[1]);
	}

	get xyzz(): vec4 {
		return new vec4(this[0], this[1], this[2], this[2]);
	}

	get xyzw(): vec4 {
		return new vec4(this[0], this[1], this[2], this[3]);
	}

	get xywx(): vec4 {
		return new vec4(this[0], this[1], this[3], this[0]);
	}

	get xywy(): vec4 {
		return new vec4(this[0], this[1], this[3], this[1]);
	}

	get xywz(): vec4 {
		return new vec4(this[0], this[1], this[3], this[2]);
	}

	get xyww(): vec4 {
		return new vec4(this[0], this[1], this[3], this[3]);
	}

	get xzxx(): vec4 {
		return new vec4(this[0], this[2], this[0], this[0]);
	}

	get xzxy(): vec4 {
		return new vec4(this[0], this[2], this[0], this[1]);
	}

	get xzxz(): vec4 {
		return new vec4(this[0], this[2], this[0], this[2]);
	}

	get xzxw(): vec4 {
		return new vec4(this[0], this[2], this[0], this[3]);
	}

	get xzyx(): vec4 {
		return new vec4(this[0], this[2], this[1], this[0]);
	}

	get xzyy(): vec4 {
		return new vec4(this[0], this[2], this[1], this[1]);
	}

	get xzyz(): vec4 {
		return new vec4(this[0], this[2], this[1], this[2]);
	}

	get xzyw(): vec4 {
		return new vec4(this[0], this[2], this[1], this[3]);
	}

	get xzzx(): vec4 {
		return new vec4(this[0], this[2], this[2], this[0]);
	}

	get xzzy(): vec4 {
		return new vec4(this[0], this[2], this[2], this[1]);
	}

	get xzzz(): vec4 {
		return new vec4(this[0], this[2], this[2], this[2]);
	}

	get xzzw(): vec4 {
		return new vec4(this[0], this[2], this[2], this[3]);
	}

	get xzwx(): vec4 {
		return new vec4(this[0], this[2], this[3], this[0]);
	}

	get xzwy(): vec4 {
		return new vec4(this[0], this[2], this[3], this[1]);
	}

	get xzwz(): vec4 {
		return new vec4(this[0], this[2], this[3], this[2]);
	}

	get xzww(): vec4 {
		return new vec4(this[0], this[2], this[3], this[3]);
	}

	get xwxx(): vec4 {
		return new vec4(this[0], this[3], this[0], this[0]);
	}

	get xwxy(): vec4 {
		return new vec4(this[0], this[3], this[0], this[1]);
	}

	get xwxz(): vec4 {
		return new vec4(this[0], this[3], this[0], this[2]);
	}

	get xwxw(): vec4 {
		return new vec4(this[0], this[3], this[0], this[3]);
	}

	get xwyx(): vec4 {
		return new vec4(this[0], this[3], this[1], this[0]);
	}

	get xwyy(): vec4 {
		return new vec4(this[0], this[3], this[1], this[1]);
	}

	get xwyz(): vec4 {
		return new vec4(this[0], this[3], this[1], this[2]);
	}

	get xwyw(): vec4 {
		return new vec4(this[0], this[3], this[1], this[3]);
	}

	get xwzx(): vec4 {
		return new vec4(this[0], this[3], this[2], this[0]);
	}

	get xwzy(): vec4 {
		return new vec4(this[0], this[3], this[2], this[1]);
	}

	get xwzz(): vec4 {
		return new vec4(this[0], this[3], this[2], this[2]);
	}

	get xwzw(): vec4 {
		return new vec4(this[0], this[3], this[2], this[3]);
	}

	get xwwx(): vec4 {
		return new vec4(this[0], this[3], this[3], this[0]);
	}

	get xwwy(): vec4 {
		return new vec4(this[0], this[3], this[3], this[1]);
	}

	get xwwz(): vec4 {
		return new vec4(this[0], this[3], this[3], this[2]);
	}

	get xwww(): vec4 {
		return new vec4(this[0], this[3], this[3], this[3]);
	}

	get yxxx(): vec4 {
		return new vec4(this[1], this[0], this[0], this[0]);
	}

	get yxxy(): vec4 {
		return new vec4(this[1], this[0], this[0], this[1]);
	}

	get yxxz(): vec4 {
		return new vec4(this[1], this[0], this[0], this[2]);
	}

	get yxxw(): vec4 {
		return new vec4(this[1], this[0], this[0], this[3]);
	}

	get yxyx(): vec4 {
		return new vec4(this[1], this[0], this[1], this[0]);
	}

	get yxyy(): vec4 {
		return new vec4(this[1], this[0], this[1], this[1]);
	}

	get yxyz(): vec4 {
		return new vec4(this[1], this[0], this[1], this[2]);
	}

	get yxyw(): vec4 {
		return new vec4(this[1], this[0], this[1], this[3]);
	}

	get yxzx(): vec4 {
		return new vec4(this[1], this[0], this[2], this[0]);
	}

	get yxzy(): vec4 {
		return new vec4(this[1], this[0], this[2], this[1]);
	}

	get yxzz(): vec4 {
		return new vec4(this[1], this[0], this[2], this[2]);
	}

	get yxzw(): vec4 {
		return new vec4(this[1], this[0], this[2], this[3]);
	}

	get yxwx(): vec4 {
		return new vec4(this[1], this[0], this[3], this[0]);
	}

	get yxwy(): vec4 {
		return new vec4(this[1], this[0], this[3], this[1]);
	}

	get yxwz(): vec4 {
		return new vec4(this[1], this[0], this[3], this[2]);
	}

	get yxww(): vec4 {
		return new vec4(this[1], this[0], this[3], this[3]);
	}

	get yyxx(): vec4 {
		return new vec4(this[1], this[1], this[0], this[0]);
	}

	get yyxy(): vec4 {
		return new vec4(this[1], this[1], this[0], this[1]);
	}

	get yyxz(): vec4 {
		return new vec4(this[1], this[1], this[0], this[2]);
	}

	get yyxw(): vec4 {
		return new vec4(this[1], this[1], this[0], this[3]);
	}

	get yyyx(): vec4 {
		return new vec4(this[1], this[1], this[1], this[0]);
	}

	get yyyy(): vec4 {
		return new vec4(this[1], this[1], this[1], this[1]);
	}

	get yyyz(): vec4 {
		return new vec4(this[1], this[1], this[1], this[2]);
	}

	get yyyw(): vec4 {
		return new vec4(this[1], this[1], this[1], this[3]);
	}

	get yyzx(): vec4 {
		return new vec4(this[1], this[1], this[2], this[0]);
	}

	get yyzy(): vec4 {
		return new vec4(this[1], this[1], this[2], this[1]);
	}

	get yyzz(): vec4 {
		return new vec4(this[1], this[1], this[2], this[2]);
	}

	get yyzw(): vec4 {
		return new vec4(this[1], this[1], this[2], this[3]);
	}

	get yywx(): vec4 {
		return new vec4(this[1], this[1], this[3], this[0]);
	}

	get yywy(): vec4 {
		return new vec4(this[1], this[1], this[3], this[1]);
	}

	get yywz(): vec4 {
		return new vec4(this[1], this[1], this[3], this[2]);
	}

	get yyww(): vec4 {
		return new vec4(this[1], this[1], this[3], this[3]);
	}

	get yzxx(): vec4 {
		return new vec4(this[1], this[2], this[0], this[0]);
	}

	get yzxy(): vec4 {
		return new vec4(this[1], this[2], this[0], this[1]);
	}

	get yzxz(): vec4 {
		return new vec4(this[1], this[2], this[0], this[2]);
	}

	get yzxw(): vec4 {
		return new vec4(this[1], this[2], this[0], this[3]);
	}

	get yzyx(): vec4 {
		return new vec4(this[1], this[2], this[1], this[0]);
	}

	get yzyy(): vec4 {
		return new vec4(this[1], this[2], this[1], this[1]);
	}

	get yzyz(): vec4 {
		return new vec4(this[1], this[2], this[1], this[2]);
	}

	get yzyw(): vec4 {
		return new vec4(this[1], this[2], this[1], this[3]);
	}

	get yzzx(): vec4 {
		return new vec4(this[1], this[2], this[2], this[0]);
	}

	get yzzy(): vec4 {
		return new vec4(this[1], this[2], this[2], this[1]);
	}

	get yzzz(): vec4 {
		return new vec4(this[1], this[2], this[2], this[2]);
	}

	get yzzw(): vec4 {
		return new vec4(this[1], this[2], this[2], this[3]);
	}

	get yzwx(): vec4 {
		return new vec4(this[1], this[2], this[3], this[0]);
	}

	get yzwy(): vec4 {
		return new vec4(this[1], this[2], this[3], this[1]);
	}

	get yzwz(): vec4 {
		return new vec4(this[1], this[2], this[3], this[2]);
	}

	get yzww(): vec4 {
		return new vec4(this[1], this[2], this[3], this[3]);
	}

	get ywxx(): vec4 {
		return new vec4(this[1], this[3], this[0], this[0]);
	}

	get ywxy(): vec4 {
		return new vec4(this[1], this[3], this[0], this[1]);
	}

	get ywxz(): vec4 {
		return new vec4(this[1], this[3], this[0], this[2]);
	}

	get ywxw(): vec4 {
		return new vec4(this[1], this[3], this[0], this[3]);
	}

	get ywyx(): vec4 {
		return new vec4(this[1], this[3], this[1], this[0]);
	}

	get ywyy(): vec4 {
		return new vec4(this[1], this[3], this[1], this[1]);
	}

	get ywyz(): vec4 {
		return new vec4(this[1], this[3], this[1], this[2]);
	}

	get ywyw(): vec4 {
		return new vec4(this[1], this[3], this[1], this[3]);
	}

	get ywzx(): vec4 {
		return new vec4(this[1], this[3], this[2], this[0]);
	}

	get ywzy(): vec4 {
		return new vec4(this[1], this[3], this[2], this[1]);
	}

	get ywzz(): vec4 {
		return new vec4(this[1], this[3], this[2], this[2]);
	}

	get ywzw(): vec4 {
		return new vec4(this[1], this[3], this[2], this[3]);
	}

	get ywwx(): vec4 {
		return new vec4(this[1], this[3], this[3], this[0]);
	}

	get ywwy(): vec4 {
		return new vec4(this[1], this[3], this[3], this[1]);
	}

	get ywwz(): vec4 {
		return new vec4(this[1], this[3], this[3], this[2]);
	}

	get ywww(): vec4 {
		return new vec4(this[1], this[3], this[3], this[3]);
	}

	get zxxx(): vec4 {
		return new vec4(this[2], this[0], this[0], this[0]);
	}

	get zxxy(): vec4 {
		return new vec4(this[2], this[0], this[0], this[1]);
	}

	get zxxz(): vec4 {
		return new vec4(this[2], this[0], this[0], this[2]);
	}

	get zxxw(): vec4 {
		return new vec4(this[2], this[0], this[0], this[3]);
	}

	get zxyx(): vec4 {
		return new vec4(this[2], this[0], this[1], this[0]);
	}

	get zxyy(): vec4 {
		return new vec4(this[2], this[0], this[1], this[1]);
	}

	get zxyz(): vec4 {
		return new vec4(this[2], this[0], this[1], this[2]);
	}

	get zxyw(): vec4 {
		return new vec4(this[2], this[0], this[1], this[3]);
	}

	get zxzx(): vec4 {
		return new vec4(this[2], this[0], this[2], this[0]);
	}

	get zxzy(): vec4 {
		return new vec4(this[2], this[0], this[2], this[1]);
	}

	get zxzz(): vec4 {
		return new vec4(this[2], this[0], this[2], this[2]);
	}

	get zxzw(): vec4 {
		return new vec4(this[2], this[0], this[2], this[3]);
	}

	get zxwx(): vec4 {
		return new vec4(this[2], this[0], this[3], this[0]);
	}

	get zxwy(): vec4 {
		return new vec4(this[2], this[0], this[3], this[1]);
	}

	get zxwz(): vec4 {
		return new vec4(this[2], this[0], this[3], this[2]);
	}

	get zxww(): vec4 {
		return new vec4(this[2], this[0], this[3], this[3]);
	}

	get zyxx(): vec4 {
		return new vec4(this[2], this[1], this[0], this[0]);
	}

	get zyxy(): vec4 {
		return new vec4(this[2], this[1], this[0], this[1]);
	}

	get zyxz(): vec4 {
		return new vec4(this[2], this[1], this[0], this[2]);
	}

	get zyxw(): vec4 {
		return new vec4(this[2], this[1], this[0], this[3]);
	}

	get zyyx(): vec4 {
		return new vec4(this[2], this[1], this[1], this[0]);
	}

	get zyyy(): vec4 {
		return new vec4(this[2], this[1], this[1], this[1]);
	}

	get zyyz(): vec4 {
		return new vec4(this[2], this[1], this[1], this[2]);
	}

	get zyyw(): vec4 {
		return new vec4(this[2], this[1], this[1], this[3]);
	}

	get zyzx(): vec4 {
		return new vec4(this[2], this[1], this[2], this[0]);
	}

	get zyzy(): vec4 {
		return new vec4(this[2], this[1], this[2], this[1]);
	}

	get zyzz(): vec4 {
		return new vec4(this[2], this[1], this[2], this[2]);
	}

	get zyzw(): vec4 {
		return new vec4(this[2], this[1], this[2], this[3]);
	}

	get zywx(): vec4 {
		return new vec4(this[2], this[1], this[3], this[0]);
	}

	get zywy(): vec4 {
		return new vec4(this[2], this[1], this[3], this[1]);
	}

	get zywz(): vec4 {
		return new vec4(this[2], this[1], this[3], this[2]);
	}

	get zyww(): vec4 {
		return new vec4(this[2], this[1], this[3], this[3]);
	}

	get zzxx(): vec4 {
		return new vec4(this[2], this[2], this[0], this[0]);
	}

	get zzxy(): vec4 {
		return new vec4(this[2], this[2], this[0], this[1]);
	}

	get zzxz(): vec4 {
		return new vec4(this[2], this[2], this[0], this[2]);
	}

	get zzxw(): vec4 {
		return new vec4(this[2], this[2], this[0], this[3]);
	}

	get zzyx(): vec4 {
		return new vec4(this[2], this[2], this[1], this[0]);
	}

	get zzyy(): vec4 {
		return new vec4(this[2], this[2], this[1], this[1]);
	}

	get zzyz(): vec4 {
		return new vec4(this[2], this[2], this[1], this[2]);
	}

	get zzyw(): vec4 {
		return new vec4(this[2], this[2], this[1], this[3]);
	}

	get zzzx(): vec4 {
		return new vec4(this[2], this[2], this[2], this[0]);
	}

	get zzzy(): vec4 {
		return new vec4(this[2], this[2], this[2], this[1]);
	}

	get zzzz(): vec4 {
		return new vec4(this[2], this[2], this[2], this[2]);
	}

	get zzzw(): vec4 {
		return new vec4(this[2], this[2], this[2], this[3]);
	}

	get zzwx(): vec4 {
		return new vec4(this[2], this[2], this[3], this[0]);
	}

	get zzwy(): vec4 {
		return new vec4(this[2], this[2], this[3], this[1]);
	}

	get zzwz(): vec4 {
		return new vec4(this[2], this[2], this[3], this[2]);
	}

	get zzww(): vec4 {
		return new vec4(this[2], this[2], this[3], this[3]);
	}

	get zwxx(): vec4 {
		return new vec4(this[2], this[3], this[0], this[0]);
	}

	get zwxy(): vec4 {
		return new vec4(this[2], this[3], this[0], this[1]);
	}

	get zwxz(): vec4 {
		return new vec4(this[2], this[3], this[0], this[2]);
	}

	get zwxw(): vec4 {
		return new vec4(this[2], this[3], this[0], this[3]);
	}

	get zwyx(): vec4 {
		return new vec4(this[2], this[3], this[1], this[0]);
	}

	get zwyy(): vec4 {
		return new vec4(this[2], this[3], this[1], this[1]);
	}

	get zwyz(): vec4 {
		return new vec4(this[2], this[3], this[1], this[2]);
	}

	get zwyw(): vec4 {
		return new vec4(this[2], this[3], this[1], this[3]);
	}

	get zwzx(): vec4 {
		return new vec4(this[2], this[3], this[2], this[0]);
	}

	get zwzy(): vec4 {
		return new vec4(this[2], this[3], this[2], this[1]);
	}

	get zwzz(): vec4 {
		return new vec4(this[2], this[3], this[2], this[2]);
	}

	get zwzw(): vec4 {
		return new vec4(this[2], this[3], this[2], this[3]);
	}

	get zwwx(): vec4 {
		return new vec4(this[2], this[3], this[3], this[0]);
	}

	get zwwy(): vec4 {
		return new vec4(this[2], this[3], this[3], this[1]);
	}

	get zwwz(): vec4 {
		return new vec4(this[2], this[3], this[3], this[2]);
	}

	get zwww(): vec4 {
		return new vec4(this[2], this[3], this[3], this[3]);
	}

	get wxxx(): vec4 {
		return new vec4(this[3], this[0], this[0], this[0]);
	}

	get wxxy(): vec4 {
		return new vec4(this[3], this[0], this[0], this[1]);
	}

	get wxxz(): vec4 {
		return new vec4(this[3], this[0], this[0], this[2]);
	}

	get wxxw(): vec4 {
		return new vec4(this[3], this[0], this[0], this[3]);
	}

	get wxyx(): vec4 {
		return new vec4(this[3], this[0], this[1], this[0]);
	}

	get wxyy(): vec4 {
		return new vec4(this[3], this[0], this[1], this[1]);
	}

	get wxyz(): vec4 {
		return new vec4(this[3], this[0], this[1], this[2]);
	}

	get wxyw(): vec4 {
		return new vec4(this[3], this[0], this[1], this[3]);
	}

	get wxzx(): vec4 {
		return new vec4(this[3], this[0], this[2], this[0]);
	}

	get wxzy(): vec4 {
		return new vec4(this[3], this[0], this[2], this[1]);
	}

	get wxzz(): vec4 {
		return new vec4(this[3], this[0], this[2], this[2]);
	}

	get wxzw(): vec4 {
		return new vec4(this[3], this[0], this[2], this[3]);
	}

	get wxwx(): vec4 {
		return new vec4(this[3], this[0], this[3], this[0]);
	}

	get wxwy(): vec4 {
		return new vec4(this[3], this[0], this[3], this[1]);
	}

	get wxwz(): vec4 {
		return new vec4(this[3], this[0], this[3], this[2]);
	}

	get wxww(): vec4 {
		return new vec4(this[3], this[0], this[3], this[3]);
	}

	get wyxx(): vec4 {
		return new vec4(this[3], this[1], this[0], this[0]);
	}

	get wyxy(): vec4 {
		return new vec4(this[3], this[1], this[0], this[1]);
	}

	get wyxz(): vec4 {
		return new vec4(this[3], this[1], this[0], this[2]);
	}

	get wyxw(): vec4 {
		return new vec4(this[3], this[1], this[0], this[3]);
	}

	get wyyx(): vec4 {
		return new vec4(this[3], this[1], this[1], this[0]);
	}

	get wyyy(): vec4 {
		return new vec4(this[3], this[1], this[1], this[1]);
	}

	get wyyz(): vec4 {
		return new vec4(this[3], this[1], this[1], this[2]);
	}

	get wyyw(): vec4 {
		return new vec4(this[3], this[1], this[1], this[3]);
	}

	get wyzx(): vec4 {
		return new vec4(this[3], this[1], this[2], this[0]);
	}

	get wyzy(): vec4 {
		return new vec4(this[3], this[1], this[2], this[1]);
	}

	get wyzz(): vec4 {
		return new vec4(this[3], this[1], this[2], this[2]);
	}

	get wyzw(): vec4 {
		return new vec4(this[3], this[1], this[2], this[3]);
	}

	get wywx(): vec4 {
		return new vec4(this[3], this[1], this[3], this[0]);
	}

	get wywy(): vec4 {
		return new vec4(this[3], this[1], this[3], this[1]);
	}

	get wywz(): vec4 {
		return new vec4(this[3], this[1], this[3], this[2]);
	}

	get wyww(): vec4 {
		return new vec4(this[3], this[1], this[3], this[3]);
	}

	get wzxx(): vec4 {
		return new vec4(this[3], this[2], this[0], this[0]);
	}

	get wzxy(): vec4 {
		return new vec4(this[3], this[2], this[0], this[1]);
	}

	get wzxz(): vec4 {
		return new vec4(this[3], this[2], this[0], this[2]);
	}

	get wzxw(): vec4 {
		return new vec4(this[3], this[2], this[0], this[3]);
	}

	get wzyx(): vec4 {
		return new vec4(this[3], this[2], this[1], this[0]);
	}

	get wzyy(): vec4 {
		return new vec4(this[3], this[2], this[1], this[1]);
	}

	get wzyz(): vec4 {
		return new vec4(this[3], this[2], this[1], this[2]);
	}

	get wzyw(): vec4 {
		return new vec4(this[3], this[2], this[1], this[3]);
	}

	get wzzx(): vec4 {
		return new vec4(this[3], this[2], this[2], this[0]);
	}

	get wzzy(): vec4 {
		return new vec4(this[3], this[2], this[2], this[1]);
	}

	get wzzz(): vec4 {
		return new vec4(this[3], this[2], this[2], this[2]);
	}

	get wzzw(): vec4 {
		return new vec4(this[3], this[2], this[2], this[3]);
	}

	get wzwx(): vec4 {
		return new vec4(this[3], this[2], this[3], this[0]);
	}

	get wzwy(): vec4 {
		return new vec4(this[3], this[2], this[3], this[1]);
	}

	get wzwz(): vec4 {
		return new vec4(this[3], this[2], this[3], this[2]);
	}

	get wzww(): vec4 {
		return new vec4(this[3], this[2], this[3], this[3]);
	}

	get wwxx(): vec4 {
		return new vec4(this[3], this[3], this[0], this[0]);
	}

	get wwxy(): vec4 {
		return new vec4(this[3], this[3], this[0], this[1]);
	}

	get wwxz(): vec4 {
		return new vec4(this[3], this[3], this[0], this[2]);
	}

	get wwxw(): vec4 {
		return new vec4(this[3], this[3], this[0], this[3]);
	}

	get wwyx(): vec4 {
		return new vec4(this[3], this[3], this[1], this[0]);
	}

	get wwyy(): vec4 {
		return new vec4(this[3], this[3], this[1], this[1]);
	}

	get wwyz(): vec4 {
		return new vec4(this[3], this[3], this[1], this[2]);
	}

	get wwyw(): vec4 {
		return new vec4(this[3], this[3], this[1], this[3]);
	}

	get wwzx(): vec4 {
		return new vec4(this[3], this[3], this[2], this[0]);
	}

	get wwzy(): vec4 {
		return new vec4(this[3], this[3], this[2], this[1]);
	}

	get wwzz(): vec4 {
		return new vec4(this[3], this[3], this[2], this[2]);
	}

	get wwzw(): vec4 {
		return new vec4(this[3], this[3], this[2], this[3]);
	}

	get wwwx(): vec4 {
		return new vec4(this[3], this[3], this[3], this[0]);
	}

	get wwwy(): vec4 {
		return new vec4(this[3], this[3], this[3], this[1]);
	}

	get wwwz(): vec4 {
		return new vec4(this[3], this[3], this[3], this[2]);
	}

	get wwww(): vec4 {
		return new vec4(this[3], this[3], this[3], this[3]);
	}

	set x(v: number) {
		this[0] = v;
	}

	set y(v: number) {
		this[1] = v;
	}

	set z(v: number) {
		this[2] = v;
	}

	set w(v: number) {
		this[3] = v;
	}

	set xy(v: vec2) {
		this[0] = v[0];
		this[1] = v[1];
	}

	set xz(v: vec2) {
		this[0] = v[0];
		this[2] = v[1];
	}

	set xw(v: vec2) {
		this[0] = v[0];
		this[3] = v[1];
	}

	set yx(v: vec2) {
		this[1] = v[0];
		this[0] = v[1];
	}

	set yz(v: vec2) {
		this[1] = v[0];
		this[2] = v[1];
	}

	set yw(v: vec2) {
		this[1] = v[0];
		this[3] = v[1];
	}

	set zx(v: vec2) {
		this[2] = v[0];
		this[0] = v[1];
	}

	set zy(v: vec2) {
		this[2] = v[0];
		this[1] = v[1];
	}

	set zw(v: vec2) {
		this[2] = v[0];
		this[3] = v[1];
	}

	set wx(v: vec2) {
		this[3] = v[0];
		this[0] = v[1];
	}

	set wy(v: vec2) {
		this[3] = v[0];
		this[1] = v[1];
	}

	set wz(v: vec2) {
		this[3] = v[0];
		this[2] = v[1];
	}

	set xyz(v: vec3) {
		this[0] = v[0];
		this[1] = v[1];
		this[2] = v[2];
	}

	set xyw(v: vec3) {
		this[0] = v[0];
		this[1] = v[1];
		this[3] = v[2];
	}

	set xzy(v: vec3) {
		this[0] = v[0];
		this[2] = v[1];
		this[1] = v[2];
	}

	set xzw(v: vec3) {
		this[0] = v[0];
		this[2] = v[1];
		this[3] = v[2];
	}

	set xwy(v: vec3) {
		this[0] = v[0];
		this[3] = v[1];
		this[1] = v[2];
	}

	set xwz(v: vec3) {
		this[0] = v[0];
		this[3] = v[1];
		this[2] = v[2];
	}

	set yxz(v: vec3) {
		this[1] = v[0];
		this[0] = v[1];
		this[2] = v[2];
	}

	set yxw(v: vec3) {
		this[1] = v[0];
		this[0] = v[1];
		this[3] = v[2];
	}

	set yzx(v: vec3) {
		this[1] = v[0];
		this[2] = v[1];
		this[0] = v[2];
	}

	set yzw(v: vec3) {
		this[1] = v[0];
		this[2] = v[1];
		this[3] = v[2];
	}

	set ywx(v: vec3) {
		this[1] = v[0];
		this[3] = v[1];
		this[0] = v[2];
	}

	set ywz(v: vec3) {
		this[1] = v[0];
		this[3] = v[1];
		this[2] = v[2];
	}

	set zxy(v: vec3) {
		this[2] = v[0];
		this[0] = v[1];
		this[1] = v[2];
	}

	set zxw(v: vec3) {
		this[2] = v[0];
		this[0] = v[1];
		this[3] = v[2];
	}

	set zyx(v: vec3) {
		this[2] = v[0];
		this[1] = v[1];
		this[0] = v[2];
	}

	set zyw(v: vec3) {
		this[2] = v[0];
		this[1] = v[1];
		this[3] = v[2];
	}

	set zwx(v: vec3) {
		this[2] = v[0];
		this[3] = v[1];
		this[0] = v[2];
	}

	set zwy(v: vec3) {
		this[2] = v[0];
		this[3] = v[1];
		this[1] = v[2];
	}

	set wxy(v: vec3) {
		this[3] = v[0];
		this[0] = v[1];
		this[1] = v[2];
	}

	set wxz(v: vec3) {
		this[3] = v[0];
		this[0] = v[1];
		this[2] = v[2];
	}

	set wyx(v: vec3) {
		this[3] = v[0];
		this[1] = v[1];
		this[0] = v[2];
	}

	set wyz(v: vec3) {
		this[3] = v[0];
		this[1] = v[1];
		this[2] = v[2];
	}

	set wzx(v: vec3) {
		this[3] = v[0];
		this[2] = v[1];
		this[0] = v[2];
	}

	set wzy(v: vec3) {
		this[3] = v[0];
		this[2] = v[1];
		this[1] = v[2];
	}

	set xyzw(v: vec4) {
		this[0] = v[0];
		this[1] = v[1];
		this[2] = v[2];
		this[3] = v[3];
	}

	set xywz(v: vec4) {
		this[0] = v[0];
		this[1] = v[1];
		this[3] = v[2];
		this[2] = v[3];
	}

	set xzyw(v: vec4) {
		this[0] = v[0];
		this[2] = v[1];
		this[1] = v[2];
		this[3] = v[3];
	}

	set xzwy(v: vec4) {
		this[0] = v[0];
		this[2] = v[1];
		this[3] = v[2];
		this[1] = v[3];
	}

	set xwyz(v: vec4) {
		this[0] = v[0];
		this[3] = v[1];
		this[1] = v[2];
		this[2] = v[3];
	}

	set xwzy(v: vec4) {
		this[0] = v[0];
		this[3] = v[1];
		this[2] = v[2];
		this[1] = v[3];
	}

	set yxzw(v: vec4) {
		this[1] = v[0];
		this[0] = v[1];
		this[2] = v[2];
		this[3] = v[3];
	}

	set yxwz(v: vec4) {
		this[1] = v[0];
		this[0] = v[1];
		this[3] = v[2];
		this[2] = v[3];
	}

	set yzxw(v: vec4) {
		this[1] = v[0];
		this[2] = v[1];
		this[0] = v[2];
		this[3] = v[3];
	}

	set yzwx(v: vec4) {
		this[1] = v[0];
		this[2] = v[1];
		this[3] = v[2];
		this[0] = v[3];
	}

	set ywxz(v: vec4) {
		this[1] = v[0];
		this[3] = v[1];
		this[0] = v[2];
		this[2] = v[3];
	}

	set ywzx(v: vec4) {
		this[1] = v[0];
		this[3] = v[1];
		this[2] = v[2];
		this[0] = v[3];
	}

	set zxyw(v: vec4) {
		this[2] = v[0];
		this[0] = v[1];
		this[1] = v[2];
		this[3] = v[3];
	}

	set zxwy(v: vec4) {
		this[2] = v[0];
		this[0] = v[1];
		this[3] = v[2];
		this[1] = v[3];
	}

	set zyxw(v: vec4) {
		this[2] = v[0];
		this[1] = v[1];
		this[0] = v[2];
		this[3] = v[3];
	}

	set zywx(v: vec4) {
		this[2] = v[0];
		this[1] = v[1];
		this[3] = v[2];
		this[0] = v[3];
	}

	set zwxy(v: vec4) {
		this[2] = v[0];
		this[3] = v[1];
		this[0] = v[2];
		this[1] = v[3];
	}

	set zwyx(v: vec4) {
		this[2] = v[0];
		this[3] = v[1];
		this[1] = v[2];
		this[0] = v[3];
	}

	set wxyz(v: vec4) {
		this[3] = v[0];
		this[0] = v[1];
		this[1] = v[2];
		this[2] = v[3];
	}

	set wxzy(v: vec4) {
		this[3] = v[0];
		this[0] = v[1];
		this[2] = v[2];
		this[1] = v[3];
	}

	set wyxz(v: vec4) {
		this[3] = v[0];
		this[1] = v[1];
		this[0] = v[2];
		this[2] = v[3];
	}

	set wyzx(v: vec4) {
		this[3] = v[0];
		this[1] = v[1];
		this[2] = v[2];
		this[0] = v[3];
	}

	set wzxy(v: vec4) {
		this[3] = v[0];
		this[2] = v[1];
		this[0] = v[2];
		this[1] = v[3];
	}

	set wzyx(v: vec4) {
		this[3] = v[0];
		this[2] = v[1];
		this[1] = v[2];
		this[0] = v[3];
	}

}

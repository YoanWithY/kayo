import vec from "./vec";
import vec3 from "./vec3"
import vec4 from "./vec4"
export default class vec2 implements vec<vec2> {
	[n: number]: number;
	0: number;
	1: number;

	*[Symbol.iterator](): IterableIterator<number> {
		yield this[0];
		yield this[1];
	}

	/**
	 * Constructor for a vec2.
	 * @param x x-component of the new vector.
	 * @param y y-component of the new vector.
	 */
	constructor(x: number = 0, y: number = 0) {
		this[0] = x;
		this[1] = y;
	}

	/**
	 * The 2-dimensional null-vector.
	 * @returns A new vector representing the null vector.
	 */
	static get NULL(): vec2 {
		return new vec2(0, 0);
	}

	/**
	 * The 2-dimensional x-axis vector.
	 * @returns A new 2-dimensional x-axis vector.
	 */
	public static get X(): vec2 {
		return new vec2(1, 0);
	}

	/**
	 * The 2-dimensional y-axis vector.
	 * @returns A new 2-dimensional y-axis vector.
	 */
	public static get Y(): vec2 {
		return new vec2(0, 1);
	}

	public add(v: vec2): vec2 {
		return new vec2(this[0] + v[0], this[1] + v[1]);
	}

	public addS(f: number): vec2 {
		return new vec2(this[0] + f, this[1] + f);
	}

	public sub(v: vec2): vec2 {
		return new vec2(this[0] - v[0], this[1] - v[1]);
	}

	public subS(f: number): vec2 {
		return new vec2(this[0] - f, this[1] - f);
	}

	public mul(v: vec2): vec2 {
		return new vec2(this[0] * v[0], this[1] * v[1]);
	}

	public mulS(f: number): vec2 {
		return new vec2(this[0] * f, this[1] * f);
	}

	public div(v: vec2): vec2 {
		return new vec2(this[0] / v[0], this[1] / v[1]);
	}

	public divS(f: number): vec2 {
		return new vec2(this[0] / f, this[1] / f);
	}

	public rest(v: vec2): vec2 {
		return new vec2(this[0] % v[0], this[1] % v[1]);
	}

	public restS(f: number): vec2 {
		return new vec2(this[0] % f, this[1] % f);
	}

	public pow(v: vec2): vec2 {
		return new vec2(this[0] ** v[0], this[1] ** v[1]);
	}

	public powS(f: number): vec2 {
		return new vec2(this[0] ** f, this[1] ** f);
	}

	public dot(v: vec2): number {
		return this[0] * v[0] + this[1] * v[1];
	}

	public norm(): number {
		return Math.sqrt(this[0] * this[0] + this[1] * this[1]);
	}

	public normalize(): vec2 {
		const l = 1 / Math.sqrt(this[0] * this[0] + this[1] * this[1]);
		return new vec2(this[0] * l, this[1] * l);
	}

	public distance(v: vec2): number {
		return v.sub(this).norm();
	}

	public static distance(x1: number, y1: number, x2: number, y2: number): number {
		const d0 = x2 - x1;
		const d1 = y2 - y1;
		return Math.sqrt(d0 * d0 + d1 * d1);
	}

	public static sum(...v: vec2[]): vec2 {
		let x = 0, y = 0;
		for (const vec of v) {
			x += vec[0];
			y += vec[1];
		}
		return new vec2(x, y);
	}

	public static average(...v: vec2[]): vec2 {
		return vec2.sum(...v).divS(v.length);
	}

	/**
	 * Pushes the values of this vector in the given array.
	 */
	public pushInArray(arr: number[]): void {
		arr.push(this[0], this[1]);
	}

	/**
	 * Pushes the values of this vector in the given Float32Array at the specified index.
	 * @param arr The array to push into.
	 * @param startIndex The index where to start the insertion.
	 */
	public pushInFloat32Array(arr: Float32Array, startIndex: number = 0): void {
		arr[startIndex] = this[0];
		arr[startIndex + 1] = this[1];
	}

	get x(): number {
		return this[0];
	}

	get y(): number {
		return this[1];
	}

	get xx(): vec2 {
		return new vec2(this[0], this[0]);
	}

	get xy(): vec2 {
		return new vec2(this[0], this[1]);
	}

	get yx(): vec2 {
		return new vec2(this[1], this[0]);
	}

	get yy(): vec2 {
		return new vec2(this[1], this[1]);
	}

	get xxx(): vec3 {
		return new vec3(this[0], this[0], this[0]);
	}

	get xxy(): vec3 {
		return new vec3(this[0], this[0], this[1]);
	}

	get xyx(): vec3 {
		return new vec3(this[0], this[1], this[0]);
	}

	get xyy(): vec3 {
		return new vec3(this[0], this[1], this[1]);
	}

	get yxx(): vec3 {
		return new vec3(this[1], this[0], this[0]);
	}

	get yxy(): vec3 {
		return new vec3(this[1], this[0], this[1]);
	}

	get yyx(): vec3 {
		return new vec3(this[1], this[1], this[0]);
	}

	get yyy(): vec3 {
		return new vec3(this[1], this[1], this[1]);
	}

	get xxxx(): vec4 {
		return new vec4(this[0], this[0], this[0], this[0]);
	}

	get xxxy(): vec4 {
		return new vec4(this[0], this[0], this[0], this[1]);
	}

	get xxyx(): vec4 {
		return new vec4(this[0], this[0], this[1], this[0]);
	}

	get xxyy(): vec4 {
		return new vec4(this[0], this[0], this[1], this[1]);
	}

	get xyxx(): vec4 {
		return new vec4(this[0], this[1], this[0], this[0]);
	}

	get xyxy(): vec4 {
		return new vec4(this[0], this[1], this[0], this[1]);
	}

	get xyyx(): vec4 {
		return new vec4(this[0], this[1], this[1], this[0]);
	}

	get xyyy(): vec4 {
		return new vec4(this[0], this[1], this[1], this[1]);
	}

	get yxxx(): vec4 {
		return new vec4(this[1], this[0], this[0], this[0]);
	}

	get yxxy(): vec4 {
		return new vec4(this[1], this[0], this[0], this[1]);
	}

	get yxyx(): vec4 {
		return new vec4(this[1], this[0], this[1], this[0]);
	}

	get yxyy(): vec4 {
		return new vec4(this[1], this[0], this[1], this[1]);
	}

	get yyxx(): vec4 {
		return new vec4(this[1], this[1], this[0], this[0]);
	}

	get yyxy(): vec4 {
		return new vec4(this[1], this[1], this[0], this[1]);
	}

	get yyyx(): vec4 {
		return new vec4(this[1], this[1], this[1], this[0]);
	}

	get yyyy(): vec4 {
		return new vec4(this[1], this[1], this[1], this[1]);
	}

	set x(v: number) {
		this[0] = v;
	}

	set y(v: number) {
		this[1] = v;
	}

	set xy(v: vec2) {
		this[0] = v[0];
		this[1] = v[1];
	}

	set yx(v: vec2) {
		this[1] = v[0];
		this[0] = v[1];
	}

}

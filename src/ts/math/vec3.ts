import vec2 from "./vec2"
import vec4 from "./vec4"
export default class vec3 {
	[n: number]: number;
	0: number;
	1: number;
	2: number;

	*[Symbol.iterator](): IterableIterator<number> {
		yield this[0];
		yield this[1];
		yield this[2];
	}

	/**
	 * Constructor for a vec3.
	 * @param x x-component of the new vector.
	 * @param y y-component of the new vector.
	 * @param z z-component of the new vector.
	 */
	constructor(x: number = 0, y: number = 0, z: number = 0) {
		this[0] = x;
		this[1] = y;
		this[2] = z;
	}

	/**
	 * The 3-dimensional null-vector.
	 * @returns A new vector representing the null vector.
	 */
	static get NULL(): vec3 {
		return new vec3(0, 0, 0);
	}

	/**
	 * The 3-dimensional x-axis vector.
	 * @returns A new 3-dimensional x-axis vector.
	 */
	public static get X(): vec3 {
		return new vec3(1, 0, 0);
	}

	/**
	 * The 3-dimensional y-axis vector.
	 * @returns A new 3-dimensional y-axis vector.
	 */
	public static get Y(): vec3 {
		return new vec3(0, 1, 0);
	}

	/**
	 * The 3-dimensional z-axis vector.
	 * @returns A new 3-dimensional z-axis vector.
	 */
	public static get Z(): vec3 {
		return new vec3(0, 0, 1);
	}

	public add(v: vec3): vec3 {
		return new vec3(this[0] + v[0], this[1] + v[1], this[2] + v[2]);
	}

	public addS(f: number): vec3 {
		return new vec3(this[0] + f, this[1] + f, this[2] + f);
	}

	public sub(v: vec3): vec3 {
		return new vec3(this[0] - v[0], this[1] - v[1], this[2] - v[2]);
	}

	public subS(f: number): vec3 {
		return new vec3(this[0] - f, this[1] - f, this[2] - f);
	}

	public mul(v: vec3): vec3 {
		return new vec3(this[0] * v[0], this[1] * v[1], this[2] * v[2]);
	}

	public mulS(f: number): vec3 {
		return new vec3(this[0] * f, this[1] * f, this[2] * f);
	}

	public div(v: vec3): vec3 {
		return new vec3(this[0] / v[0], this[1] / v[1], this[2] / v[2]);
	}

	public divS(f: number): vec3 {
		return new vec3(this[0] / f, this[1] / f, this[2] / f);
	}

	public rest(v: vec3): vec3 {
		return new vec3(this[0] % v[0], this[1] % v[1], this[2] % v[2]);
	}

	public restS(f: number): vec3 {
		return new vec3(this[0] % f, this[1] % f, this[2] % f);
	}

	public pow(v: vec3): vec3 {
		return new vec3(this[0] ** v[0], this[1] ** v[1], this[2] ** v[2]);
	}

	public powS(f: number): vec3 {
		return new vec3(this[0] ** f, this[1] ** f, this[2] ** f);
	}

	public dot(v: vec3): number {
		return this[0] * v[0] + this[1] * v[1] + this[2] * v[2];
	}

	public norm(): number {
		return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
	}

	public normalize(): vec3 {
		const l = 1 / Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
		return new vec3(this[0] * l, this[1] * l, this[2] * l);
	}

	public distance(v: vec3): number {
		return v.sub(this).norm();
	}

	public static distance(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
		const d0 = x2 - x1;
		const d1 = y2 - y1;
		const d2 = z2 - z1;
		return Math.sqrt(d0 * d0 + d1 * d1 + d2 * d2);
	}

	public static sum(...v: vec3[]): vec3 {
		let x = 0, y = 0, z = 0;
		for (const vec of v) {
			x += vec[0];
			y += vec[1];
			z += vec[2];
		}
		return new vec3(x, y, z);
	}

	public static average(...v: vec3[]): vec3 {
		return vec3.sum(...v).divS(v.length);
	}

	/**
	 * Pushes the values of this vector in the given array.
	 */
	public pushInArray(arr: number[]): void {
		arr.push(this[0], this[1], this[2]);
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
	}

	public cross(v: vec3): vec3 {
		return new vec3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
	}

	/**
	 * (θ, φ, r) → (x, y, z) following ISO/IEC 80000:
	 * 
	 * (θ, φ, r) ↦ (r · sin(θ) · cos(φ), r · sin(θ) · cos(φ), r · cos(θ))
	 * @param theta θ the polar angle from +Z in radiance
	 * @param phi φ the azimuthal angle from +X in the XY-plane in radiance
	 * @param r distance to the origin
	 * @returns The Euclidean point from the spherical coordinates.
	 */
	public static sphericalToEuclidean(theta: number, phi: number, r: number = 1): vec3 {
		const st = Math.sin(theta);
		return new vec3(r * st * Math.cos(phi), r * st * Math.sin(phi), r * Math.cos(theta));
	}

	/**
	 * (θ, φ) → (x, y, z) following ISO/IEC 80000:
	 * 
	 * (θ, φ) ↦ (cos(θ) · cos(φ), cos(θ) · sin(φ), -sin(θ))
	 * @param theta θ the polar angle from +Z in radiance
	 * @param phi φ the azimuthal angle from +X in the XY-plane in radiance
	 * @returns The Euclidean unit tangent on the point on the longitude circle from the spherical coordinates pointing towards the increasing polar angle direction.
	 */
	public static longitudeTangent(theta: number, phi: number): vec3 {
		const ct = Math.cos(theta);
		return new vec3(ct * Math.cos(phi), ct * Math.sin(phi), -Math.sin(theta));
	}

	/**
	 * φ → (x, y, z) following ISO/IEC 80000:
	 * 
	 * φ ↦ (-sin(φ), cos(φ), 0)
	 * @param phi φ the azimuthal angle from +X in the XY-plane in radiance
	 * @returns The Euclidean unit tangent on the latitude circle from the azimuthal angle towards the increasing azimuthal angle direction.
	 */
	public static latitudeTangent(phi: number): vec3 {
		return new vec3(-Math.sin(phi), Math.cos(phi), 0);
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

	get xx(): vec2 {
		return new vec2(this[0], this[0]);
	}

	get xy(): vec2 {
		return new vec2(this[0], this[1]);
	}

	get xz(): vec2 {
		return new vec2(this[0], this[2]);
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

	get zx(): vec2 {
		return new vec2(this[2], this[0]);
	}

	get zy(): vec2 {
		return new vec2(this[2], this[1]);
	}

	get zz(): vec2 {
		return new vec2(this[2], this[2]);
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

	get xyx(): vec3 {
		return new vec3(this[0], this[1], this[0]);
	}

	get xyy(): vec3 {
		return new vec3(this[0], this[1], this[1]);
	}

	get xyz(): vec3 {
		return new vec3(this[0], this[1], this[2]);
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

	get yxx(): vec3 {
		return new vec3(this[1], this[0], this[0]);
	}

	get yxy(): vec3 {
		return new vec3(this[1], this[0], this[1]);
	}

	get yxz(): vec3 {
		return new vec3(this[1], this[0], this[2]);
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

	get yzx(): vec3 {
		return new vec3(this[1], this[2], this[0]);
	}

	get yzy(): vec3 {
		return new vec3(this[1], this[2], this[1]);
	}

	get yzz(): vec3 {
		return new vec3(this[1], this[2], this[2]);
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

	get zyx(): vec3 {
		return new vec3(this[2], this[1], this[0]);
	}

	get zyy(): vec3 {
		return new vec3(this[2], this[1], this[1]);
	}

	get zyz(): vec3 {
		return new vec3(this[2], this[1], this[2]);
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

	get xxxx(): vec4 {
		return new vec4(this[0], this[0], this[0], this[0]);
	}

	get xxxy(): vec4 {
		return new vec4(this[0], this[0], this[0], this[1]);
	}

	get xxxz(): vec4 {
		return new vec4(this[0], this[0], this[0], this[2]);
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

	get xxzx(): vec4 {
		return new vec4(this[0], this[0], this[2], this[0]);
	}

	get xxzy(): vec4 {
		return new vec4(this[0], this[0], this[2], this[1]);
	}

	get xxzz(): vec4 {
		return new vec4(this[0], this[0], this[2], this[2]);
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

	get xyyx(): vec4 {
		return new vec4(this[0], this[1], this[1], this[0]);
	}

	get xyyy(): vec4 {
		return new vec4(this[0], this[1], this[1], this[1]);
	}

	get xyyz(): vec4 {
		return new vec4(this[0], this[1], this[1], this[2]);
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

	get xzxx(): vec4 {
		return new vec4(this[0], this[2], this[0], this[0]);
	}

	get xzxy(): vec4 {
		return new vec4(this[0], this[2], this[0], this[1]);
	}

	get xzxz(): vec4 {
		return new vec4(this[0], this[2], this[0], this[2]);
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

	get xzzx(): vec4 {
		return new vec4(this[0], this[2], this[2], this[0]);
	}

	get xzzy(): vec4 {
		return new vec4(this[0], this[2], this[2], this[1]);
	}

	get xzzz(): vec4 {
		return new vec4(this[0], this[2], this[2], this[2]);
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

	get yxyx(): vec4 {
		return new vec4(this[1], this[0], this[1], this[0]);
	}

	get yxyy(): vec4 {
		return new vec4(this[1], this[0], this[1], this[1]);
	}

	get yxyz(): vec4 {
		return new vec4(this[1], this[0], this[1], this[2]);
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

	get yyxx(): vec4 {
		return new vec4(this[1], this[1], this[0], this[0]);
	}

	get yyxy(): vec4 {
		return new vec4(this[1], this[1], this[0], this[1]);
	}

	get yyxz(): vec4 {
		return new vec4(this[1], this[1], this[0], this[2]);
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

	get yyzx(): vec4 {
		return new vec4(this[1], this[1], this[2], this[0]);
	}

	get yyzy(): vec4 {
		return new vec4(this[1], this[1], this[2], this[1]);
	}

	get yyzz(): vec4 {
		return new vec4(this[1], this[1], this[2], this[2]);
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

	get yzyx(): vec4 {
		return new vec4(this[1], this[2], this[1], this[0]);
	}

	get yzyy(): vec4 {
		return new vec4(this[1], this[2], this[1], this[1]);
	}

	get yzyz(): vec4 {
		return new vec4(this[1], this[2], this[1], this[2]);
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

	get zxxx(): vec4 {
		return new vec4(this[2], this[0], this[0], this[0]);
	}

	get zxxy(): vec4 {
		return new vec4(this[2], this[0], this[0], this[1]);
	}

	get zxxz(): vec4 {
		return new vec4(this[2], this[0], this[0], this[2]);
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

	get zxzx(): vec4 {
		return new vec4(this[2], this[0], this[2], this[0]);
	}

	get zxzy(): vec4 {
		return new vec4(this[2], this[0], this[2], this[1]);
	}

	get zxzz(): vec4 {
		return new vec4(this[2], this[0], this[2], this[2]);
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

	get zyyx(): vec4 {
		return new vec4(this[2], this[1], this[1], this[0]);
	}

	get zyyy(): vec4 {
		return new vec4(this[2], this[1], this[1], this[1]);
	}

	get zyyz(): vec4 {
		return new vec4(this[2], this[1], this[1], this[2]);
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

	get zzxx(): vec4 {
		return new vec4(this[2], this[2], this[0], this[0]);
	}

	get zzxy(): vec4 {
		return new vec4(this[2], this[2], this[0], this[1]);
	}

	get zzxz(): vec4 {
		return new vec4(this[2], this[2], this[0], this[2]);
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

	get zzzx(): vec4 {
		return new vec4(this[2], this[2], this[2], this[0]);
	}

	get zzzy(): vec4 {
		return new vec4(this[2], this[2], this[2], this[1]);
	}

	get zzzz(): vec4 {
		return new vec4(this[2], this[2], this[2], this[2]);
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

	set xy(v: vec2) {
		this[0] = v[0];
		this[1] = v[1];
	}

	set xz(v: vec2) {
		this[0] = v[0];
		this[2] = v[1];
	}

	set yx(v: vec2) {
		this[1] = v[0];
		this[0] = v[1];
	}

	set yz(v: vec2) {
		this[1] = v[0];
		this[2] = v[1];
	}

	set zx(v: vec2) {
		this[2] = v[0];
		this[0] = v[1];
	}

	set zy(v: vec2) {
		this[2] = v[0];
		this[1] = v[1];
	}

	set xyz(v: vec3) {
		this[0] = v[0];
		this[1] = v[1];
		this[2] = v[2];
	}

	set xzy(v: vec3) {
		this[0] = v[0];
		this[2] = v[1];
		this[1] = v[2];
	}

	set yxz(v: vec3) {
		this[1] = v[0];
		this[0] = v[1];
		this[2] = v[2];
	}

	set yzx(v: vec3) {
		this[1] = v[0];
		this[2] = v[1];
		this[0] = v[2];
	}

	set zxy(v: vec3) {
		this[2] = v[0];
		this[0] = v[1];
		this[1] = v[2];
	}

	set zyx(v: vec3) {
		this[2] = v[0];
		this[1] = v[1];
		this[0] = v[2];
	}

}

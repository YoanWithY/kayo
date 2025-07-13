import vec from "../math/vec";

export default abstract class Spline<T extends vec<T>> {
	public points: T[] = [];

	public abstract getAt(t: number): T | undefined;
}

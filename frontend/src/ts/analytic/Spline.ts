import vec from "../math/vec";

export default abstract class Spline<T extends vec<T>> {
	points: T[] = [];

	abstract getAt(t: number): T | undefined;
}

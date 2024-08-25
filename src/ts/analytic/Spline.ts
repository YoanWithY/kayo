import vec from "../math/vec";

export default abstract class Spline<T extends vec<T>> {
    points: T[] = [];

    abstract getAt(t: number): T | undefined;
}

export class BezierSpline<N extends number, T extends vec<T>> extends Spline<T> {
    getAt(t: number): T | undefined {
        if (this.points.length === 0)
            return undefined;
    }
}
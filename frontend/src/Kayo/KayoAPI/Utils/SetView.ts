export class SetView<T> {
    private _set: Set<T>;
    public constructor(set: Set<T>) {
        this._set = set;
    }
    public has(element: T) {
        return this._set.has(element);
    }
}
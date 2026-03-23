export class APIMap<T, U> implements Iterable<[T, U]> {
    private _map: Map<T, U>;

    private _addListeners: Array<(key: T, value: U) => void> = [];
    private _deleteListeners: Array<(key: T, value: U) => void> = [];

    public constructor() {
        this._map = new Map<T, U>();
    }

    public add(key: T, value: U) {
        this._map.set(key, value);
        for (const callback of this._addListeners)
            callback(key, value);
    }

    public delete(key: T) {
        const value = this._map.get(key);
        if (value === undefined)
            return false;

        const existed = this._map.delete(key);
        if (!existed)
            return false;

        for (const callback of this._deleteListeners)
            callback(key, value);

        return true;
    }

    public addAddListener(listener: (key: T, value: U) => void, fireImmediatelyForAllCurrent: boolean) {
        this._addListeners.push(listener);

        if (!fireImmediatelyForAllCurrent)
            return

        for (const [key, value] of this._map)
            listener(key, value);
    }

    public addDeleteListener(listener: (key: T, value: U) => void, fireImmediatelyForAllCurrent: boolean = false) {
        this._deleteListeners.push(listener);

        if (!fireImmediatelyForAllCurrent)
            return;

        for (const [k, v] of this._map)
            listener(k, v);
    }

    public get(key: T) {
        return this._map.get(key);
    }

    public has(key: T) {
        return this._map.has(key);
    }

    public clear() {
        for (const [k, v] of this._map) {
            for (const l of this._deleteListeners) {
                l(k, v);
            }
        }
        this._map.clear();
    }

    public get size() {
        return this._map.size;
    }

    public [Symbol.iterator]() {
        return this._map[Symbol.iterator]();
    }

    public entries() {
        return this._map.entries();
    }

    public keys() {
        return this._map.keys();
    }

    public values() {
        return this._map.values();
    }
}
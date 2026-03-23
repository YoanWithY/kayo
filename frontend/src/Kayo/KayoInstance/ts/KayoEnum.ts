
export class KayoEnum<T extends string | number> {
    private _values: { key: T, text: string }[];
    private _map: Map<T, number>;
    public constructor(values: { key: T, text: string }[]) {
        this._values = values;
        this._map = new Map();
        for (let i = 0; i < values.length; i++)
            this._map.set(values[i].key, i);
    }

    public getIndexByKey(key: T) {
        return this._map.get(key);
    }

    public getKeyByIndex(i: number) {
        const v = this._values[i];
        if (!v)
            return undefined;
        return v.key;
    }

    public get maxValue() {
        return this._values.length - 1;
    }
}
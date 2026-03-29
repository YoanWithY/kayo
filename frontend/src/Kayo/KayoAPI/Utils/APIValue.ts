import { BooleanFCurve, EnumFCurve, KayoNumber } from "../../KayoInstance/c/KayoCorePP";
import { isKayoNumber, KayoAPI } from "../KayoAPI";
import { KayoEnum } from "../../KayoInstance/ts/KayoEnum";
import { View, ViewControllTarget } from "../../../IO-Interface/Binding";

export abstract class AnimatebleAPIValue<I, O> implements ViewControllTarget<I, O> {
    protected _kayoAPI: KayoAPI
    protected _observers: Set<View<O>>;

    public constructor(kayoAPI: KayoAPI) {
        this._kayoAPI = kayoAPI;
        this._observers = new Set();
    }

    public abstract getValue(): O;
    public abstract setValue(v: I, fullRerender: boolean): void;

    public addChangeObserver(o: View<O>, fireImmediately: boolean): void {
        this._observers.add(o);
        if (fireImmediately)
            o.recieveValueChange(this.getValue());
    }
}

export class AnimatableEnumAPIValue<T extends string | number> extends AnimatebleAPIValue<KayoNumber, T> {
    protected _fcurve: EnumFCurve;
    protected _enum: KayoEnum<T>;

    public constructor(kayoAPI: KayoAPI, fcurve: EnumFCurve, kayoEnum: KayoEnum<T>) {
        super(kayoAPI);
        this._enum = kayoEnum;
        this._fcurve = fcurve;
    }

    public getValue(): T {
        return this._enum.getKeyByIndex(this._fcurve.sample(this._kayoAPI.project.currentTime)) as T;
    }

    public setValue(v: T | KayoNumber, fullRerender: boolean) {
        if (!isKayoNumber(v)) {
            const i = this._enum.getIndexByKey(v);
            if (i === undefined) {
                console.error("Could not set value", v, "on", this);
                return;
            }
            v = this._kayoAPI.KN.fromDouble(i);
        }

        this._fcurve.setValueAt(this._kayoAPI.project.currentTime, v, false);
        if (fullRerender)
            this._kayoAPI.ui.fullRerender();
    }

    public get enum() {
        return this._enum;
    }
}

export class AnimatableBooleanAPIValue extends AnimatebleAPIValue<KayoNumber, boolean> {
    protected _fcurve: BooleanFCurve;

    public constructor(kayoAPI: KayoAPI, fcurve: BooleanFCurve) {
        super(kayoAPI);
        this._fcurve = fcurve;
    }

    public getValue(): boolean {
        return this._fcurve.sample(this._kayoAPI.project.currentTime);
    }

    public setValue(v: boolean | KayoNumber, fullRerender: boolean): void {
        if (typeof v === "boolean")
            v = this._kayoAPI.KN.fromDouble(v ? 1 : 0);

        this._fcurve.setValueAt(this._kayoAPI.project.currentTime, v, false);
        if (fullRerender)
            this._kayoAPI.ui.fullRerender();
    }
}
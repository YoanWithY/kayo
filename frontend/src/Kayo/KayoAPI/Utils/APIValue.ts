import { BooleanFCurve, EnumFCurve, KayoNumber } from "../../KayoInstance/c/KayoCorePP";
import { KayoAPI } from "../KayoAPI";
import { KayoEnum } from "../../KayoInstance/ts/KayoEnum";

export abstract class AnimatebleAPIValue<I, O> {
    protected _kayoAPI: KayoAPI

    public constructor(kayoAPI: KayoAPI) {
        this._kayoAPI = kayoAPI;
    }

    public abstract getValue(): O;
    public abstract setValue(v: I, fullRerender: boolean): void;
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

    public setValue(v: KayoNumber, fullRerender: boolean) {
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

    public setValue(v: KayoNumber, fullRerender: boolean): void {
        this._fcurve.setValueAt(this._kayoAPI.project.currentTime, v, false);
        if (fullRerender)
            this._kayoAPI.ui.fullRerender();
    }
}
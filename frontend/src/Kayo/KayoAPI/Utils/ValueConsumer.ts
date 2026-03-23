import { KayoNumber } from "../../KayoInstance/c/KayoCorePP";
import { KayoEnum } from "../../KayoInstance/ts/KayoEnum";
import { KayoAPI } from "../KayoAPI";

export class ValueSetter {
    public static numberEnum(kayoAPI: KayoAPI, value: number | KayoNumber, target: { setValue(v: KayoNumber, fullrerender: boolean): void, enum: KayoEnum<number> }, fullrerender: boolean = true) {
        if (typeof value !== "number") {
            target.setValue(value, fullrerender);
            return;
        }

        const i = target.enum.getIndexByKey(value);
        if (i === undefined) {
            console.error("Could not find enum index of ", value, "for", target);
            return;
        }
        target.setValue(kayoAPI.KN.fromDouble(i), fullrerender);
    }

    public static stringEnum(kayoAPI: KayoAPI, value: string | KayoNumber, target: { setValue(v: KayoNumber, fullrerender: boolean): void, enum: KayoEnum<string> }, fullrerender: boolean = true) {
        if (typeof value !== "string") {
            target.setValue(value, fullrerender);
            return;
        }

        const i = target.enum.getIndexByKey(value);
        if (i === undefined) {
            console.error("Could not find enum index of ", value, "for", target);
            return;
        }
        target.setValue(kayoAPI.KN.fromDouble(i), fullrerender);
    }

    public static booleanValue(kayoAPI: KayoAPI, value: boolean | KayoNumber, target: { setValue(v: KayoNumber, fullrerender: boolean): void }, fullrerender: boolean = true) {
        if (typeof value !== "boolean") {
            target.setValue(value, fullrerender);
            return;
        }

        target.setValue(kayoAPI.KN.fromDouble(value ? 1 : 0), fullrerender);
    }
}
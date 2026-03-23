import { Background } from "../../KayoInstance/ts/lights/Background";

export class BackgroundAPI {
    private _background: Background;
    public constructor(background: Background) {
        this._background = background;
    }

    public get internal() {
        return this._background;
    }
}
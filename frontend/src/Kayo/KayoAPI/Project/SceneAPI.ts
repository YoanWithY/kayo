import { Scene } from "../../KayoInstance/ts/project/Scene";
import { BackgroundAPI } from "./BackgroundAPI";
import { SceneObjectAPI } from "./SceneObjectAPI";

export class SceneAPI {
    private _scene: Scene;
    private _background?: BackgroundAPI;
    public constructor(scene: Scene) {
        this._scene = scene;
    }

    public get sceneKey() {
        return this._scene.sceneKey;
    }

    public get internal() {
        return this._scene;
    }

    public get background() {
        return this._background;
    }

    public set background(background: BackgroundAPI | undefined) {
        this._background = background;
        if (background)
            this._scene.setBackground(background.internal);
        else
            this._scene.setBackground(undefined);
    }

    public add(sceneObject: SceneObjectAPI) {
        this._scene.add(sceneObject.internal);
    }

}
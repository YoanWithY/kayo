import { SceneObject } from "../../KayoInstance/ts/project/SceneObject";

export interface SceneObjectAPI {
    get sceneObjectAPIType(): string;
    get internal(): SceneObject;
}
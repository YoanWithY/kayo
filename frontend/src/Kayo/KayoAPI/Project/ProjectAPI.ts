import { Grid } from "../../KayoInstance/ts/debug/Grid";
import { Background } from "../../KayoInstance/ts/lights/Background";
import { Project } from "../../KayoInstance/ts/project/Project";
import { Scene } from "../../KayoInstance/ts/project/Scene";
import { Renderer3D } from "../../KayoInstance/ts/Renderer";
import { RealtimeSpecificRenderConfig } from "../../KayoInstance/ts/rendering/config/RealtimeRenderConfig";
import { RenderConfig } from "../../KayoInstance/ts/rendering/config/RenderConfig";
import { RealtimeRenderer } from "../../KayoInstance/ts/rendering/RealtimeRenderer";
import { KayoAPI } from "../KayoAPI";
import { APIMap } from "../Utils/APIMap";
import { BackgroundAPI } from "./BackgroundAPI";
import { GridAPI } from "./Debug/GridAPI";
import { RenderConfigAPI } from "./RenderConfigAPI";
import { Renderer3DAPI } from "./RendererAPI";
import { SceneAPI } from "./SceneAPI";

export class ProjectAPI {
    private _project: Project;
    private _kayoAPI: KayoAPI
    private _notfications: Map<number, Set<() => void>>;
    private _renderers3D: APIMap<string, Renderer3DAPI>;
    private _scenes: APIMap<string, SceneAPI>;
    private _currentScene!: SceneAPI;

    public constructor(kayoAPI: KayoAPI) {
        this._kayoAPI = kayoAPI;
        this._project = kayoAPI.internal.project;
        this._notfications = new Map();

        this._renderers3D = new APIMap();
        const setRendererEntry = (k: string, v: Renderer3DAPI) => {
            this._project.renderers.set(k, v.internal);
        }
        this._renderers3D.addAddListener(setRendererEntry, true);

        this._scenes = new APIMap();
        const setSceneEntry = (k: string, v: SceneAPI) => {
            this._project.scenes.set(k, v.internal);
        }
        this._scenes.addAddListener(setSceneEntry, true);


        // todo: move to deserializer
        const config = new RenderConfig(kayoAPI.internal, "realtime default", new RealtimeSpecificRenderConfig(kayoAPI.internal));
        const realtimeRenderer = new RealtimeRenderer(this._kayoAPI.internal, config);
        this.registerRenderer3D(realtimeRenderer);
        this.addNewScene();
        this.setCurrentScene(this._scenes.get("scene") as SceneAPI);

        const background = new Background();
        this.currentScene.background = new BackgroundAPI(background);

        this.currentScene.add(new GridAPI(new Grid()));
    }

    public registerRenderer3D(renderer: Renderer3D,) {
        this._renderers3D.add(renderer.rendererKey, new Renderer3DAPI(this._kayoAPI, renderer, new RenderConfigAPI(this._kayoAPI, renderer.config)));
        for (const scene of this._scenes.values())
            scene.internal.setRepresentation(renderer.createSceneRepresentation(scene.internal, this.currentTime));
    }

    public addNewScene(name: string = "scene") {
        const originalName = name;
        let i = 0;
        while (this._scenes.has(name))
            name = `${originalName}_${++i}`;

        const scene = new Scene(name);
        const sceneAPI = new SceneAPI(scene);

        for (const r of this._renderers3D.values())
            scene.setRepresentation(r.internal.createSceneRepresentation(scene, this.currentTime));

        this._scenes.add(name, sceneAPI);
    }

    public setCurrentScene(scene: SceneAPI) {
        this._currentScene = scene;
        this._project.currentScene = this._currentScene.internal;
    }

    public get renderers() {
        return this._renderers3D;
    }

    public allocID() {
        return this._project.allocID();
    }

    public get currentTime() {
        return this._project.currentTime;
    }

    public get currentScene() {
        return this._currentScene;
    }

    public addNotificationListener(id: number, f: () => void) {
        let callbackSet = this._notfications.get(id);
        if (!callbackSet) {
            callbackSet = new Set();
            this._notfications.set(id, callbackSet);
        }
        callbackSet.add(f);
    }

    public removeNotificationListener(id: number, f: () => void) {
        const callbackSet = this._notfications.get(id);
        if (!callbackSet)
            return;
        callbackSet.delete(f);
    }

    public close(onClosedCallback: () => void) {
        onClosedCallback();
    }

}
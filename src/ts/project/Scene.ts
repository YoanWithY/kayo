import Camera from "../Viewport/Camera";
import ViewportCamera from "../Viewport/ViewportCamera";
import RaymarchingScene from "../raymarching/raymarchingScene";
import World from "./World";

export default class Scene {
    world = new World()
    raymarchScene = new RaymarchingScene();

    public render(viewport: ViewportCamera) {
        this.world.render(viewport);
        // this.raymarchScene.render(viewport);
    }
}
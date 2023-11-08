import ViewportCamera from "../Viewport/ViewportCamera";
import dynamicObject, { DynamicObjectRenderer } from "../dynamicObject/dynamicObject";
import RaymarchingScene from "../raymarching/raymarchingScene";
import { gl } from "../rendering/glInit";
import World from "./World";

export default class Scene {
    world = new World()
    raymarchScene = new RaymarchingScene();

    dynamicObjects = new Set<dynamicObject>();
    dynmaicObjectRender = new DynamicObjectRenderer();

    public render(viewport: ViewportCamera) {
        this.world.render(viewport);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.depthMask(true);
        for (const dynOb of this.dynamicObjects) {
            this.dynmaicObjectRender.render(dynOb);
        }
        // this.raymarchScene.render(viewport);
    }
}
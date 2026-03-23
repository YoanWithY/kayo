import { Renderer, Renderer3D } from "../../KayoInstance/ts/Renderer";
import { UIViewport } from "../../KayoInstance/ts/Viewport/UIViewport";
import { Viewport } from "../../KayoInstance/ts/Viewport/Viewport";
import { KayoAPI } from "../KayoAPI";
import { SetView } from "../Utils/SetView";
import { RenderConfigAPI } from "./RenderConfigAPI";

export class RendererAPI {
    private _kayoAPI: KayoAPI;
    private _renderer: Renderer;
    private _registeredViewports: SetView<Viewport>;

    public constructor(kayoAPI: KayoAPI, renderer: Renderer) {
        this._kayoAPI = kayoAPI;
        this._renderer = renderer;
        this._registeredViewports = new SetView(this._renderer.registeredViewports);
    }

    public get registeredViewports() {
        return this._registeredViewports;
    }

    public renderViewport(viewport: Viewport) {
        this._renderer.renderViewport(this._kayoAPI.project.currentTime, viewport);
    }

    public registerViewport(viewport: Viewport) {
        this._renderer.registerViewport(viewport);
    }

    public unregisterViewport(viewport: UIViewport) {
        this._renderer.unregisterViewport(viewport);
    }

    public get internal() {
        return this._renderer;
    }
}

export class Renderer3DAPI extends RendererAPI {
    private _config: RenderConfigAPI;

    public constructor(kayo: KayoAPI, renderer: Renderer3D, config: RenderConfigAPI) {
        super(kayo, renderer);
        this._config = config;
    }

    public get config() {
        return this._config;
    }

    public get internal() {
        return super.internal as Renderer3D;
    }
}
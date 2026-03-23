import { KayoUIAPI } from "../KayoUI/KayoUIAPI";
import { KayoUI } from "../KayoUI/KayoUI";
import { KayoNullUI } from "../KayoUI/KayoNullAPI";
import { GPUX } from "../KayoInstance/ts/GPUX";
import { KayoInstance } from "../KayoInstance/ts/KayoInstance";
import TextureUtils from "../KayoInstance/ts/Textures/TextureUtils";
import { Project } from "../KayoInstance/ts/project/Project";
import initWasmx from "../KayoInstance/ts/ressourceManagement/KayoWasmLoader";
import { IOAPI } from "../../IO-Interface/IOAPI";
import { ProjectAPI } from "./Project/ProjectAPI";
import { WindowUIBuilder } from "../../UI-Lib/WindowUIBUilder";

export function allocUUID(): string {
    return crypto.randomUUID();
}

export class KayoAPI implements IOAPI {
    private _kayoInstance: KayoInstance;
    private _kayoUI: KayoUIAPI;
    private _project!: ProjectAPI;

    private constructor(kayoInstance: KayoInstance, kayoUI: KayoUIAPI) {
        this._kayoInstance = kayoInstance;
        this._kayoUI = kayoUI;
    }

    public openProject(projectID?: string) {
        this._kayoUI.showLoadingScreen();

        const installProject = () => {
            let project: Project;
            if (projectID === undefined) {
                project = new Project(this._kayoInstance, allocUUID());
            } else {
                // todo
                project = new Project(this._kayoInstance, allocUUID());
            }
            this._kayoInstance.project = project
            window.document.title = `Kayo Engine ${import.meta.env.PACKAGE_VERSION} - ${project.displayName}`;


            this._project = new ProjectAPI(this);

            for (const winUI of this.ui.windowUIBuilder)
                this._kayoUI.requestInstanceUI(winUI, "viewport-3d-pane", true);

            this._kayoUI.removeLoadingScreen();
            this._kayoUI.removeSplashScreen();
        };

        if (this.project) {
            this.project.close(installProject);
        } else {
            installProject();
        }
    }

    public get ui() {
        return this._kayoUI;
    }

    public get project() {
        return this._project;
    }

    public get gpux() {
        return this._kayoInstance.gpux;
    }

    public get wasmx() {
        return this._kayoInstance.wasmx;
    }

    public get wasm() {
        return this.wasmx.wasm;
    }

    public get KN() {
        return this.wasm.KN;
    }

    public get internal() {
        return this._kayoInstance;
    }

    private static _initialized = false;
    public static async createInstance(createEditorUI: boolean) {
        if (this._initialized)
            return (window as any).kayoAPI as KayoAPI;

        const kayoUI = createEditorUI ? KayoUI.createInstance() : new KayoNullUI();
        const initStepCallback = (text: string) => {
            kayoUI.setLoadingParagraphText(`Init\n${text}...`);
        }

        initStepCallback("WebGPU");
        // eslint-disable-next-line local/no-await
        const gpux = await GPUX.requestGPUX();
        if (typeof gpux === "string")
            return `Could not initialize WGPU because: ${gpux}`;

        TextureUtils.init(gpux);

        initStepCallback("WASM");
        // eslint-disable-next-line local/no-await
        const wasmx = await initWasmx();

        const kayoAPI = new KayoAPI(new KayoInstance(gpux, wasmx), kayoUI);
        kayoUI.init(kayoAPI);

        const winUIBuilder = new WindowUIBuilder(window, kayoAPI)

        kayoUI.registerUIWindowBuilder(winUIBuilder);

        const beforeUnloadCallback = (_: Event) => {
            for (const windowUI of kayoUI.windowUIBuilder) {
                if (windowUI.window !== window)
                    windowUI.window.close();
            }
        }
        window.addEventListener("beforeunload", beforeUnloadCallback)

        kayoUI.setLoadingParagraphText("Init Kayo...");

        let error = false;
        const onInitError = () => error = true;
        const onKayoInit = () => {
            kayoAPI._kayoInstance.cleanUpFileSystem();
            kayoUI.removeLoadingScreen();
            kayoUI.showSplashScreen();
        }
        kayoAPI._kayoInstance.init(onKayoInit, onInitError);
        if (error)
            return "init error";

        this._initialized = true;
        return kayoAPI;
    }

    public get APIName() {
        return `Kayo ${import.meta.env.PACKAGE_VERSION}`;
    }

}
import { UIElementBuilder } from "../../../../UI-Lib/UIElementBuilder";
import { KayoAPI } from "../../../KayoAPI/KayoAPI";
import vec2 from "../../../KayoInstance/ts/math/vec2";
import vec3 from "../../../KayoInstance/ts/math/vec3";
import { Viewport } from "../../../KayoInstance/ts/Viewport/Viewport";
import LookAtTransform from "../../../KayoInstance/ts/transformation/LookAt";
import ViewportCamera from "../../../KayoInstance/ts/Viewport/ViewportCamera";
import { RenderConfigAPI } from "../../../KayoAPI/Project/RenderConfigAPI";
import { WindowUIBuilder } from "../../../../UI-Lib/WindowUIBUilder";
import css from "./ViewportPaneContent.css?inline";

export class Viewport3DPaneContent extends HTMLElement implements Viewport {
    public kayoAPI!: KayoAPI;
    public camera!: ViewportCamera;

    public canvasContext!: GPUCanvasContext;
    public canvas!: HTMLCanvasElement;

    private _resizeCallback = (e: ResizeObserverEntry[]) => {
        const sizeDPX = e[0].devicePixelContentBoxSize[0];
        const sizeCPX = e[0].contentBoxSize[0];
        const s = 1;
        this.canvas.width = Math.ceil(sizeDPX.inlineSize / s);
        this.canvas.height = Math.ceil(sizeDPX.blockSize / s);
        if (s === 1) {
            this.canvas.style.width = "auto";
            this.canvas.style.height = "auto";
        } else {
            this.canvas.style.width = `${Math.ceil(sizeCPX.inlineSize / s) * s}px`;
            this.canvas.style.height = `${Math.ceil(sizeCPX.blockSize / s) * s}px`;
        }
        if (this.isConnected) this.kayoAPI.ui.requestAnimationFrameWith(this);
    };

    private _resizeObserver: ResizeObserver = new ResizeObserver(this._resizeCallback);

    public lable = "My Viewport";
    public window!: Window;
    public config!: RenderConfigAPI;
    public lookAt!: LookAtTransform;

    public get rendererKey() {
        return this.config.configKey;
    }

    public useOverlays: boolean = false;

    private viewBuffer = new Float32Array(3 * 16 + 2 * 4);
    private viewTimeBuffer = new Uint32Array(8);
    public updateView(viewUBO: GPUBuffer, frame: number): void {
        const near = this.camera.projection.near;
        const far = this.camera.projection.far;
        this.camera.getViewMatrix().pushInFloat32ArrayColumnMajor(this.viewBuffer);
        this.camera
            .getProjection()
            .getProjectionMatrix(this.canvas.width, this.canvas.height)
            .pushInFloat32ArrayColumnMajor(this.viewBuffer, 16);
        this.camera.transformationStack
            .getTransformationMatrix()
            .pushInFloat32ArrayColumnMajor(this.viewBuffer, 2 * 16);
        this.viewBuffer.set(
            [
                near,
                far,
                this.window.devicePixelRatio,
                1, // exposure factor
                1, // gamma
                256, // number of red colors, min 2^1, max 2^16
                256, // number of red colors, min 2^1, max 2^16
                256, // number of red colors, min 2^1, max 2^16
            ],
            3 * 16,
        );
        this.kayoAPI.gpux.gpuDevice.queue.writeBuffer(viewUBO, 0, this.viewBuffer);

        this.viewTimeBuffer.set([0, 0, this.canvas.width, this.canvas.height, frame, 0, 0, 0], 0);
        this.kayoAPI.gpux.gpuDevice.queue.writeBuffer(viewUBO, this.viewBuffer.byteLength, this.viewTimeBuffer);
    }

    public getCurrentTexture(): GPUTexture {
        return this.canvasContext.getCurrentTexture();
    }

    private _timeRingCach = new Array(30).fill(
        {
            JavaScript: 0,
            Render: 0,
            indexResolve: 0,
            Selection: 0,
            Overlays: 0,
            compositingTime: 0,
        },
        0,
        30,
    );
    private _timeRingCurrentIndex = 0;
    public setGPUTime(_: any): void {
        // todo
    }

    public get timeRingeCach() {
        return this._timeRingCach;
    }

    public get timeRingeCachCurrentIndex() {
        return this._timeRingCurrentIndex;
    }

    protected _wheelCallback = (e: WheelEvent) => {
        e.preventDefault();
        const val = e.deltaY / this.window.devicePixelRatio;
        this.lookAt.r += (this.lookAt.r * val) / 1024;
        this.kayoAPI.ui.requestAnimationFrameWith(this);
    };

    protected _rotateView = (dx: number, dy: number) => {
        this.lookAt.phi -= dx / 256;
        this.lookAt.theta -= dy / 256;
    };

    protected _shiftView = (dx: number, dy: number) => {
        const lat = vec3.latitudeTangent(this.lookAt.phi);
        const lon = vec3.longitudeTangent(this.lookAt.theta, this.lookAt.phi);
        this.lookAt.p = this.lookAt.p.add(
            lat.mulS((-dx / 256) * this.lookAt.r).add(lon.mulS((-dy / 256) * this.lookAt.r)),
        );
    };

    protected _keyMap: any = {};
    protected _touches: Touch[] = [];
    protected _documentKeyDownCallback = (e: KeyboardEvent) => (this._keyMap[e.key] = true);
    protected _documentKeyUpCallback = (e: KeyboardEvent) => delete this._keyMap[e.key];
    protected _touchStartCallback = (e: TouchEvent) => {
        for (const t of e.touches) this._touches[t.identifier] = t;
    };
    protected _touchMoveCallback = (e: TouchEvent) => {
        this.kayoAPI.ui.requestAnimationFrameWith(this);
        if (e.touches.length === 1) {
            const thisT = e.touches[0];
            const lastT = this._touches[thisT.identifier];
            this._rotateView(thisT.clientX - lastT.clientX, thisT.clientY - lastT.clientY);
            this._touches[thisT.identifier] = thisT;
        } else if (e.touches.length === 2) {
            const thisT1 = e.touches[0];
            const lastT1 = this._touches[thisT1.identifier];
            const thisT2 = e.touches[1];
            const lastT2 = this._touches[thisT2.identifier];
            const dx1 = thisT1.clientX - lastT1.clientX;
            const dy1 = thisT1.clientY - lastT1.clientY;
            const dx2 = thisT2.clientX - lastT2.clientX;
            const dy2 = thisT2.clientY - lastT2.clientY;
            const lastD = vec2.distance(lastT1.clientX, lastT1.clientY, lastT2.clientX, lastT2.clientY);
            const thisD = vec2.distance(thisT1.clientX, thisT1.clientY, thisT2.clientX, thisT2.clientY);
            const zoom = lastD / thisD;
            this._touches[thisT1.identifier] = thisT1;
            this._touches[thisT2.identifier] = thisT2;
            this.lookAt.r *= zoom;
            this._shiftView((dx1 + dx2) / 2, (dy1 + dy2) / 2);
        }
    };
    protected _touchEndCallback = (e: TouchEvent) => {
        for (const t of e.changedTouches) delete this._touches[t.identifier];
    };
    protected _keyListener = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === " ") {
            this.requestFullscreen();
            this.kayoAPI.ui.fullRerender();
        }
    };
    protected _mouseEnterCallback = () => {
        this.window.addEventListener("keydown", this._keyListener);
    };
    protected _mouseLeaveCallback = () => {
        this.window.removeEventListener("keydown", this._keyListener);
    };
    protected connectedCallback() {
        this.kayoAPI.ui.registerViewport(this);

        this._resizeObserver.observe(this, {
            box: "device-pixel-content-box",
        });

        const orbitMove = (e: MouseEvent) => {
            if (e.shiftKey) this._shiftView(e.movementX, e.movementY);
            else this._rotateView(e.movementX, e.movementY);
            this.kayoAPI.ui.requestAnimationFrameWith(this);
        };

        const walkLook = (e: MouseEvent) => {
            const camPos1 = this.camera.getWorldLocation();
            const dphi = e.movementX / 256;
            const dtheta = e.movementY / 256;
            this.lookAt.phi -= dphi;
            this.lookAt.theta -= dtheta;
            const camPos2 = this.camera.getWorldLocation();
            this.lookAt.p = this.lookAt.p.add(camPos1.sub(camPos2));
            this.kayoAPI.ui.requestAnimationFrameWith(this);
        };

        const speed = 0.25;
        const mm = (e: MouseEvent) => {
            if (this.window.document.pointerLockElement)
                return;
            this.requestPointerLock();
            if (e.buttons === 4) {
                this.addEventListener("mousemove", orbitMove);
                orbitMove(e);
            } else if (e.buttons === 2) {
                this.addEventListener("mousemove", walkLook);
                walkLook(e);
                const walkMove = () => {
                    const mat = this.camera.transformationStack.getTransformationMatrix();
                    if (this._keyMap["w"]) {
                        this.lookAt.p = this.lookAt.p.sub(mat.getColumn(2).xyz.mulS(speed));
                        this.kayoAPI.ui.requestAnimationFrameWith(this);
                    }

                    if (this._keyMap["s"]) {
                        this.lookAt.p = this.lookAt.p.sub(mat.getColumn(2).xyz.mulS(-speed));
                        this.kayoAPI.ui.requestAnimationFrameWith(this);
                    }

                    if (this._keyMap["a"]) {
                        this.lookAt.p = this.lookAt.p.sub(mat.getColumn(0).xyz.mulS(speed));
                        this.kayoAPI.ui.requestAnimationFrameWith(this);
                    }

                    if (this._keyMap["d"]) {
                        this.lookAt.p = this.lookAt.p.sub(mat.getColumn(0).xyz.mulS(-speed));
                        this.kayoAPI.ui.requestAnimationFrameWith(this);
                    }
                };
                walkMove();
            }
        };

        this.onmousedown = (e) => {
            e.preventDefault();
            this.addEventListener("mousemove", mm);
        };

        this.onmouseup = () => {
            this.removeEventListener("mousemove", walkLook);
            this.removeEventListener("mousemove", orbitMove);
            this.removeEventListener("mousemove", mm);
            this.window.document.exitPointerLock();
        };

        this.window.document.body.addEventListener("keydown", this._documentKeyDownCallback);
        this.window.document.body.addEventListener("keyup", this._documentKeyUpCallback);
        this.addEventListener("wheel", this._wheelCallback, { passive: false });
        this.addEventListener("touchstart", this._touchStartCallback, { passive: false });
        this.addEventListener("touchmove", this._touchMoveCallback, { passive: false });
        this.addEventListener("touchend", this._touchEndCallback);
        this.addEventListener("mouseenter", this._mouseEnterCallback);
        this.addEventListener("mouseleave", this._mouseLeaveCallback);
    }

    protected disconnectedCallback() {
        this.kayoAPI.ui.unregisterViewport(this);
        this._resizeObserver.unobserve(this);

        this.window.document.body.removeEventListener("keydown", this._documentKeyDownCallback);
        this.window.document.body.removeEventListener("keyup", this._documentKeyUpCallback);
        this.removeEventListener("wheel", this._wheelCallback);
        this.removeEventListener("touchstart", this._touchStartCallback);
        this.removeEventListener("touchmove", this._touchMoveCallback);
        this.removeEventListener("touchend", this._touchEndCallback);
        this.removeEventListener("mouseenter", this._mouseEnterCallback);
        this.removeEventListener("mouseleave", this._mouseLeaveCallback);
    }

}

export class Viewport3DPaneContentBuilder extends UIElementBuilder<KayoAPI, Viewport3DPaneContent> {
    protected _domClassName = "viewport-3d-pane-content";

    protected get _domClass() {
        return Viewport3DPaneContent;
    }

    public build(windowUIBuilder: WindowUIBuilder<KayoAPI>, _: any): Viewport3DPaneContent {
        const viewport3DContent = windowUIBuilder.createElement<Viewport3DPaneContent>(this._domClassName);

        viewport3DContent.window = windowUIBuilder.window;
        viewport3DContent.kayoAPI = windowUIBuilder.IOAPI;
        viewport3DContent.lookAt = new LookAtTransform(new vec3(0, 0, 0), 10, 1, 1);
        viewport3DContent.camera = new ViewportCamera();
        viewport3DContent.camera.transformationStack.push(viewport3DContent.lookAt);

        viewport3DContent.canvas = windowUIBuilder.createElement<HTMLCanvasElement>("canvas");
        viewport3DContent.appendChild(viewport3DContent.canvas);
        viewport3DContent.canvasContext = viewport3DContent.canvas.getContext("webgpu") as GPUCanvasContext;

        const renderer = viewport3DContent.kayoAPI.project.renderers.get("realtime default");
        if (!renderer) {
            console.error("No renderer found!");
            return viewport3DContent;
        }
        viewport3DContent.config = renderer.config;


        return viewport3DContent;
    }

    protected _initWindowComponentStyles(windowUIBuilder: WindowUIBuilder<KayoAPI>): void {
        windowUIBuilder.addStyle(css);
    }
}
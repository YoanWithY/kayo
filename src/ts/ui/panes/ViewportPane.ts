import ViewportCamera from "../../Viewport/ViewportCamera";
import vec2 from "../../math/vec2";
import vec3 from "../../math/vec3";
import { bitDepthToSwapChainFormat } from "../../project/Config";
import { gpuDevice } from "../../GPUX";
import LookAtTransform from "../../transformation/LookAt";
import { openProject } from "../../project/Project";

export class ViewportPane extends HTMLElement {

    static viewports = new Set<ViewportPane>;

    public camera = new ViewportCamera();
    public renderAttachment!: GPUTexture;
    private previousRectangle = {
        left: -1, rigth: - 1, width: -1, height: -1
    };


    resizeObserver: ResizeObserver = new ResizeObserver(() => { });

    constructor() {
        super();

        this.renderAttachment = gpuDevice.createTexture({
            format: bitDepthToSwapChainFormat(openProject.config.output.display.swapChainBitDepth),
            size: [4, 4, 1],
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.resizeObserver.observe(this);

        const lookAt = new LookAtTransform();
        this.camera.transformationStack.push(lookAt);

        const rotateView = (dx: number, dy: number) => {
            lookAt.phi -= dx / 256;
            lookAt.theta -= dy / 256;
        }

        const shiftView = (dx: number, dy: number) => {
            const lat = vec3.latitudeTangent(lookAt.phi);
            const lon = vec3.longitudeTangent(lookAt.theta, lookAt.phi);
            lookAt.p = lookAt.p.add(lat.mulS(-dx / 1024 * lookAt.r).add(lon.mulS(-dy / 1024 * lookAt.r)));
        }

        const move = (e: MouseEvent) => {
            if (e.shiftKey)
                shiftView(e.movementX, e.movementY)
            else
                rotateView(e.movementX, e.movementY);
        }

        const mm = (e: MouseEvent) => {
            if (e.buttons === 1 && !document.pointerLockElement) {
                this.requestPointerLock();
                this.addEventListener("mousemove", move);
                move(e);
            }
        }

        this.onmousedown = () => {
            this.addEventListener("mousemove", mm);
        }

        this.onmouseup = () => {
            this.removeEventListener("mousemove", move);
            this.removeEventListener("mousemove", mm);
            document.exitPointerLock();
        }

        this.addEventListener("wheel", e => {
            e.preventDefault();
            const val = e.deltaY / window.devicePixelRatio;
            lookAt.r += lookAt.r * val / 1024;
        });

        const touches: Touch[] = [];
        this.addEventListener("touchstart", e => {
            for (const t of e.touches)
                touches[t.identifier] = t;
        });
        this.addEventListener("touchmove", e => {
            if (e.touches.length === 1) {
                const thisT = e.touches[0];
                const lastT = touches[thisT.identifier];
                rotateView(thisT.clientX - lastT.clientX, thisT.clientY - lastT.clientY);
                touches[thisT.identifier] = thisT;
            } else if (e.touches.length === 2) {
                const thisT1 = e.touches[0];
                const lastT1 = touches[thisT1.identifier];
                const thisT2 = e.touches[1];
                const lastT2 = touches[thisT2.identifier];
                const dx1 = thisT1.clientX - lastT1.clientX;
                const dy1 = thisT1.clientY - lastT1.clientY;
                const dx2 = thisT2.clientX - lastT2.clientX;
                const dy2 = thisT2.clientY - lastT2.clientY;
                const lastD = vec2.distance(lastT1.clientX, lastT1.clientY, lastT2.clientX, lastT2.clientY);
                const thisD = vec2.distance(thisT1.clientX, thisT1.clientY, thisT2.clientX, thisT2.clientY);
                const zoom = lastD / thisD;
                touches[thisT1.identifier] = thisT1;
                touches[thisT2.identifier] = thisT2;
                lookAt.r *= zoom;
                shiftView((dx1 + dx2) / 2, (dy1 + dy2) / 2);
            }
        });
        this.addEventListener("touchend", e => {
            for (const t of e.changedTouches)
                delete touches[t.identifier];
        })
    }

    static createViewportPane() {
        const p = document.createElement("viewport-pane") as ViewportPane;
        return p;
    }

    disconnectedCallback() {
        ViewportPane.viewports.delete(this);
    }

    connectedCallback() {
        if (this.isConnected) {
            ViewportPane.viewports.add(this);
        }
    }

    public getViewportAndUpdateAttachmentsIfNecessary(): { left: number, top: number, width: number, height: number } {
        const rect = this.getViewport();
        if (this.previousRectangle.width === rect.width && this.previousRectangle.height === rect.height)
            return rect;

        this.renderAttachment.destroy();
        this.renderAttachment = gpuDevice.createTexture({
            format: bitDepthToSwapChainFormat(openProject.config.output.display.swapChainBitDepth),
            size: [rect.width, rect.height, 1],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
            label: "Viewport render attachment and copy source"
        });
        return rect;
    }

    /**
     * With +x → and +y ↓ in px. Left and right are floored, width and height are ceiled.
     * @returns left 
     */
    getViewport(): { left: number, top: number, width: number, height: number } {
        const rect = this.getBoundingClientRect();
        const dpr = window.devicePixelRatio;
        return { left: Math.floor(rect.left * dpr), top: Math.floor(rect.top * dpr), width: Math.ceil(rect.width * dpr), height: Math.ceil(rect.height * dpr) };
    }
}

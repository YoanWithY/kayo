import { KayoNumber } from "../../c/KayoCorePP";
import { Viewport } from "./Viewport";

export interface UIViewport extends Viewport {
    window: Window;
}

export interface UI3DViewport extends UIViewport {
    /**
     * If the viewport is the attached to a canvas, the canvas context shall be provided.
     */
    canvasContext?: GPUCanvasContext;
    /**
     * The texture where the color output shall be written to.
     */
    getCurrentTexture(): GPUTexture;
    /**
     * This method recieves the GPU time spend the render passes on this viewport in nanoseconds.
     * @param time The time spend in nanoseconds.
     */
    setGPUTime(times: any): void;
    /**
     * @param viewUBO The buffer to write to.
     * @param frame The current frame time to upload.
     */
    updateView(viewUBO: GPUBuffer, frame: number): void;
    useOverlays: boolean;
}

export interface UI2DViewport extends UIViewport {
    canvasContext: CanvasRenderingContext2D;
    /**
     * The upper left coordinate of the content to display.
     */
    origin: [KayoNumber, KayoNumber];
    /**
     * The scale of the content relative to css px coordinates to display.
     */
    contentScale: [number, number];
}
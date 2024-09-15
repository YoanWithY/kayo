export interface Viewport {
	/**
	 * A string that to identify the viewport and name WebGPU debug.
	 */
	lable: string;
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
	setGPUTime(r3Time: number, overlayTime: number, compositingTime: number): void;
	/**
	 * @param viewUBO The buffer to write to.
	 * @param frame The current frame time to upload.
	 */
	updateView(viewUBO: GPUBuffer, frame: number): void;
}
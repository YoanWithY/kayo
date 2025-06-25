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
	 * The window this viewport belongs to.
	 */
	window: Window;
	/**
	 * The texture where the color output shall be written to.
	 */
	getCurrentTexture(): GPUTexture;
	/**
	 * The name (key) of the render config to use for rendering on this viewport.
	 */
	configKey: string;

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

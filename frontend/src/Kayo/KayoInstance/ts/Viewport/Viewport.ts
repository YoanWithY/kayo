export interface Viewport {
	/**
	 * The key of the renderer to use for rendering on this viewport.
	 * This would be the key of the render config for a 3D viewport, or the static name of a specialized kayo renderer.
	 */
	rendererKey: string;
}

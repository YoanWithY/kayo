import { Viewport } from "./rendering/Viewport";

export interface Renderer {
	renderViewport(timeStemp: number, viewport: Viewport): void;
	registeredViewports: Set<Viewport>;
	registerViewport(viewport: Viewport): void;
	unregisterViewport(viewport: Viewport): void;
}

import { KayoNumber } from "../c/KayoCorePP";
import { Representation, RepresentationConcept } from "./project/Representation";
import { Scene } from "./project/Scene";
import { RenderConfig } from "./rendering/config/RenderConfig";
import { Viewport } from "./Viewport/Viewport";

export interface Renderer {
	renderViewport(currentTime: KayoNumber, viewport: Viewport): void;
	registeredViewports: Set<Viewport>;
	registerViewport(viewport: Viewport): void;
	unregisterViewport(viewport: Viewport): void;
	rendererKey: string;
}

export interface Renderer3D extends Renderer {
	createSceneRepresentation(scene: Scene, currentTime: KayoNumber): Representation<RepresentationConcept, Scene>;
	get config(): RenderConfig;
}

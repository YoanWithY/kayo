import { Background } from "../lights/Background";
import { RepresentationConcept, Representable, Representation } from "./Representation";
import { SceneObject } from "./SceneObject";

export abstract class SceneRepresentation<
    T extends RepresentationConcept,
    K extends Representable
> extends Representation<T, K> {
    public abstract add(sceneObject: SceneObject): void;
    public abstract setBackground(background: Background | undefined): void;
}

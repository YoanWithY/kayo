export interface SceneObject {
    get type(): string;
    setRepresentation(rep: any): void;
}
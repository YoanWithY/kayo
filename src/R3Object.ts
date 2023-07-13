class RenderConfig {
    name = "config";
}


abstract class R3Object {
    index: number;
    transformationStack;

    constructor(index: number) {
        this.transformationStack = new TransformationStack();
        this.index = index;
    }

    getWorldLocation() {
        return mat4.getTranslation(this.transformationStack.getTransformationMatrix());
    }

    abstract updateGPU(): void;
}



interface Camera {
    getProjectionMatrix(): number[];
    getViewMatrix(): number[];
    getWorldLocation(): number[];
}

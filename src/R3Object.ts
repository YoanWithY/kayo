class R3Objekt {
    transformationStack;

    constructor() {
        this.transformationStack = new TransformationStack();
    }

    getWorldLocation() {
        return mat4.getTranslation(this.transformationStack.getTransformationMatrix());
    }
}

interface Camera {
    getProjectionMatrix(): number[];
    getViewMatrix(): number[];
    getWorldLocation(): number[];
}

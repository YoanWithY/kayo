"use strict";
class R3Objekt {
    constructor() {
        this.transformationStack = new TransformationStack();
    }
    getWorldLocation() {
        return mat4.getTranslation(this.transformationStack.getTransformationMatrix());
    }
}

"use strict";
class R3Objekt {
    constructor(index) {
        this.transformationStack = new TransformationStack();
        this.index = index;
    }
    getWorldLocation() {
        return mat4.getTranslation(this.transformationStack.getTransformationMatrix());
    }
}

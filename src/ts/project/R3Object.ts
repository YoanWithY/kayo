import TransformationStack from "../transformation/TransformationStack";

export default abstract class R3Object {
    index: number = 0;
    transformationStack;

    constructor() {
        this.transformationStack = new TransformationStack();
    }

    getWorldLocation() {
        return this.transformationStack.getTransformationMatrix().getTranslation();
    }
}

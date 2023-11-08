import TransformationStack from "../transformation/TransformationStack";

export default abstract class R3Object {
    index: number;
    transformationStack;

    constructor(index: number) {
        this.transformationStack = new TransformationStack();
        this.index = index;
    }

    getWorldLocation() {
        return this.transformationStack.getTransformationMatrix().getTranslation();
    }

    abstract updateGPU(): void;
}

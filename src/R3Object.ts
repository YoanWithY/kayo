
class R3Objekt {
    transformationStack;

    constructor() {
        this.transformationStack = new TransformationStack();
    }

    getWorldLocation() {
        return mat4.getTranslation(this.transformationStack.getTransformationMatrix());
    }
}

class MeshObject extends R3Objekt {

    a: SharedVertex;

    constructor() {
        super();
        this.a = new SharedVertex();
    }

    render() {

    }
}

interface Camera {
    getProjectionMatrix(): number[];
    getViewMatrix(): number[];
    getWorldLocation(): number[];
}

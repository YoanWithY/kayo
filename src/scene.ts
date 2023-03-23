class R3Objekt {
    transformationStack;

    constructor() {
        this.transformationStack = new TransformationStack();
    }

    getWorldLocation() {
        return mat4.getTranslation(this.transformationStack.getTransformationMatrix());
    }

}

class ViewPort3D {
    sceneCamera: Camera | null = null;
    lookAtPos = [0, 0, 0];
    theta = 0.5;
    phi = 0.5;
    r = 5;

    getViewMatrix() {
        const z = vec3.sphericalToEuclidian(this.theta, this.phi);
        return mat4.fromVec3s(vec3.latitudeTangent(this.phi), vec3.longtitudeTangent(this.theta, this.phi), z, vec3.scalarMul(z, this.r));
    };
}

class Camera extends R3Objekt {

    getViewMatrix() {
        return this.transformationStack.getInverseEffectTransformationMatrix();
    }
}

class SceneSet {

}

class Scene {

}
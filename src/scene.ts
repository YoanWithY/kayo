
class SceneCamera extends R3Object implements Camera {

    getProjectionMatrix() {
        return mat4.perspective(toRAD(90), glCanvas.width / glCanvas.height, 0.1, 1000);
    }

    getViewMatrix() {
        return this.transformationStack.getInverseEffectTransformationMatrix();
    }
}

class SceneSet {

}

class Scene {

}
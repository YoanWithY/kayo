"use strict";
class Transformation {
}
class Translation extends Transformation {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    getTransformationMatrix() {
        return mat4.translation(this.x, this.y, this.z);
    }
    getInverseEffectTransformationMatrix() {
        return mat4.translation(-this.x, -this.y, -this.z);
    }
    setValues(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    getName() {
        return "Translation";
    }
}
class RotationXYZ extends Transformation {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    getTransformationMatrix() {
        return mat4.rotateZ(mat4.rotateY(mat4.rotationX(this.x), this.y), this.z);
    }
    getInverseEffectTransformationMatrix() {
        return mat4.rotateX(mat4.rotateY(mat4.rotationZ(-this.z), -this.y), -this.x);
    }
    setValues(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    getName() {
        return "Rotation XYZ";
    }
}
class Scale extends Transformation {
    constructor() {
        super(...arguments);
        this.x = 1;
        this.y = 1;
        this.z = 1;
    }
    getTransformationMatrix() {
        return mat4.scaleation(this.x, this.y, this.z);
    }
    getInverseEffectTransformationMatrix() {
        return mat4.scaleation(1 / this.x, 1 / this.y, 1 / this.z);
    }
    setValues(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    getName() {
        return "Scale";
    }
}
class TransformationStack extends Array {
    constructor() {
        super();
        this.push(new Scale(), new RotationXYZ(), new Translation());
    }
    getTransformationMatrix() {
        let ret = this[this.length - 1].getTransformationMatrix();
        for (let i = this.length - 2; i >= 0; i--)
            ret = mat4.mult(ret, this[i].getTransformationMatrix());
        return ret;
    }
    getInverseEffectTransformationMatrix() {
        let ret = this[0].getInverseEffectTransformationMatrix();
        for (let i = 1; i < this.length; i++)
            ret = mat4.mult(ret, this[i].getInverseEffectTransformationMatrix());
        return ret;
    }
}

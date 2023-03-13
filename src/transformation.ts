"use strict";
abstract class Transformation {

    abstract getTransformationMatrix(): number[]

    abstract getInverseEffectTransformationMatrix(): number[]

    /**
     * Sets values for this transformation.
     * @param nums the number to set
     */
    abstract setValues(...nums: number[]): void

    abstract getName(): string
}

// class LookAtTransform extends Transformation {
//     p = [0, 0, 0]; theta = toRAD(90); phi = 0; r = 1;

//     getTransformationMatrix() {
//         const dir = vec3.sphericalToEuclidian(this.theta, this.phi, this.r);
//         const loc = vec3.add(this.p, dir);
//         const Z = vec3.normalize(dir);
//         const X = vec3.normalize(vec3.cross(vec3.Z, dir));
//         const Y = vec3.normalize(vec3.cross(Z, X));
//         return [
//             X[0], X[1], X[2], 0,
//             Y[0], Y[1], Y[2], 0,
//             Z[0], Z[1], Z[2], 0,
//             loc[0], loc[1], loc[1], 1
//         ];
//     }

//     getInverseEffectTransformationMatrix() {
//         const dir = vec3.sphericalToEuclidian(this.theta, this.phi, this.r);
//         console.log(dir);
//         const loc = vec3.add(this.p, dir);
//         console.log(loc);
//         const Z = vec3.normalize(dir);
//         const X = vec3.normalize(vec3.cross(vec3.Z, dir));
//         const Y = vec3.normalize(vec3.cross(Z, X));
//         return [
//             X[0], Y[0], Z[0], 0,
//             X[1], Y[1], Z[1], 0,
//             X[2], Y[2], Z[2], 0,
//             -loc[0], -loc[1], -loc[1], 1
//         ];
//     }

//     setValues(x: number, y: number, z: number, theta: number, phi: number, r: number): void {
//         this.p[0] = x;
//         this.p[1] = y;
//         this.p[2] = z;
//         this.theta = theta;
//         this.phi = phi;
//         this.r = r;
//     }

//     getName() {
//         return "LookAt";
//     }

// }

class Translation extends Transformation {
    x = 0; y = 0; z = 0;
    getTransformationMatrix() {
        return mat4.translation(this.x, this.y, this.z);
    }

    getInverseEffectTransformationMatrix() {
        return mat4.translation(-this.x, -this.y, -this.z);
    }

    setValues(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getName() {
        return "Translation";
    }
}

class RotationXYZ extends Transformation {
    x = 0; y = 0; z = 0;
    getTransformationMatrix() {
        return mat4.rotateZ(mat4.rotateY(mat4.rotationX(this.x), this.y), this.z);
    }

    getInverseEffectTransformationMatrix() {
        return mat4.rotateX(mat4.rotateY(mat4.rotationZ(-this.z), -this.y), -this.x);
    }

    setValues(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getName() {
        return "Rotation XYZ";
    }
}

class Scale extends Transformation {
    x = 1; y = 1; z = 1;
    getTransformationMatrix() {
        return mat4.scaleation(this.x, this.y, this.z);
    }

    getInverseEffectTransformationMatrix() {
        return mat4.scaleation(1 / this.x, 1 / this.y, 1 / this.z);
    }

    setValues(x: number, y: number, z: number) {
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

    getTransformationMatrix(): number[] {
        let ret = this[this.length - 1].getTransformationMatrix();
        for (let i = this.length - 2; i >= 0; i--)
            ret = mat4.mult(ret, this[i].getTransformationMatrix());
        return ret;
    }

    getInverseEffectTransformationMatrix(): number[] {
        let ret = this[0].getInverseEffectTransformationMatrix();
        for (let i = 1; i < this.length; i++)
            ret = mat4.mult(ret, this[i].getInverseEffectTransformationMatrix());
        return ret;
    }

}
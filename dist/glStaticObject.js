"use strict";
class R3Objekt {
    constructor() {
        this.transformationStack = new TransformationStack();
    }
    getWorldLocation() {
        return mat4.getTranslation(this.transformationStack.getTransformationMatrix());
    }
}
class Camera extends R3Objekt {
    getViewMatrix() {
        return this.transformationStack.getInverseEffectTransformationMatrix();
    }
}
class glObject extends R3Objekt {
    static decode(d, iP, iN, iT) {
        const p = [];
        const n = [];
        const t = [];
        for (let i = 0; i < d.length; i += 3) {
            const d0 = d[i] * 3, d1 = d[i + 1] * 3, d2 = d[i + 2] * 2;
            p.push(iP[d0], iP[d0 + 1], iP[d0 + 2]);
            n.push(iN[d1], iN[d1 + 1], iN[d1 + 2]);
            t.push(iT[d2], iT[d2 + 1]);
        }
        ;
        return [p, n, t];
    }
    ;
    constructor(index) {
        super();
        this.mode = 0;
        this.count = 0;
        this.VAO = gl.createVertexArray();
        this.index = index;
    }
    render() {
        gl.drawArrays(this.mode, 0, this.count);
    }
    bind() {
        gl.bindVertexArray(this.VAO);
    }
}
class Cube extends glObject {
    constructor(index) {
        super(index);
        gl.bindVertexArray(this.VAO);
        const PBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, PBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.p), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        const NBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, NBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.n), gl.STATIC_DRAW);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);
        const TCBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, TCBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.t), gl.STATIC_DRAW);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(2);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.mode = gl.TRIANGLES;
        this.count = Cube.p.length / 3;
    }
}
(() => {
    const iP = [1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1];
    const iN = [0, 0, -1, 1, 0, 0, 0, 0, 1, -1, 0, 0, 0, 1, 0, 0, -1, 0];
    const iT = [1, 1, 0, 1, 0, 0, 1, 0];
    const iD = [
        0, 2, 0, 1, 2, 1, 2, 2, 2, 0, 2, 0, 2, 2, 2, 3, 2, 3,
        4, 1, 0, 0, 1, 1, 3, 1, 2, 4, 1, 0, 3, 1, 2, 7, 1, 3,
        5, 0, 0, 4, 0, 1, 7, 0, 2, 5, 0, 0, 7, 0, 2, 6, 0, 3,
        1, 3, 0, 5, 3, 1, 6, 3, 2, 1, 3, 0, 6, 3, 2, 2, 3, 3,
        4, 4, 0, 5, 4, 1, 1, 4, 2, 4, 4, 0, 1, 4, 2, 0, 4, 3,
        6, 5, 0, 7, 5, 1, 3, 5, 2, 6, 5, 0, 3, 5, 2, 2, 5, 3
    ];
    const arr = glObject.decode(iD, iP, iN, iT);
    Cube.p = arr[0];
    Cube.n = arr[1];
    Cube.t = arr[2];
})();

"use strict";

class Transformation {
    x = 0; y = 0; z = 0;
    getTransformationMatrix() {
        return mat4.identity();
    };

    setValues(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getName() {
        return "Transformation";
    }
}

class Translation extends Transformation {

    getTransformationMatrix() {
        return mat4.translation(this.x, this.y, this.z);
    }

    getName() {
        return "Translation";
    }
}

class RotationXYZ extends Transformation {
    getTransformationMatrix() {
        return mat4.rotateZ(mat4.rotateY(mat4.rotationX(this.x), this.y), this.z);
    }

    getName() {
        return "Rotation XYZ";
    }
}

class Scale extends Transformation {
    constructor() {
        super();
        this.x = this.y = this.z = 1;
    }
    getTransformationMatrix() {
        return mat4.scaleation(this.x, this.y, this.z);
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
}

class glObject {
    /**Decodes the given data to an WebGL approbriate formate.
    * @param iP the set of positions required for this objct.
    * @param iN the set of normals required for this object.
    * @param iT the set of texture coordinates required for this object.
    */
    static decode(d: number[], iP: number[], iN: number[], iT: number[]) {
        const p = [];
        const n = [];
        const t = [];

        for (let i = 0; i < d.length; i += 3) {
            const d0 = d[i] * 3, d1 = d[i + 1] * 3, d2 = d[i + 2] * 2;
            p.push(iP[d0], iP[d0 + 1], iP[d0 + 2]);
            n.push(iN[d1], iN[d1 + 1], iN[d1 + 2]);
            t.push(iT[d2], iT[d2 + 1]);
        };
        // console.log(p);
        return [p, n, t];
    }

    mode = 0;
    count = 0;
    VAO = gl.createVertexArray();;
    transformationStack;
    index;

    constructor(index: number) {
        this.transformationStack = new TransformationStack();
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
    static p: number[];
    static n: number[];
    static t: number[];

    static {
        const iP = [1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1] //[p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, ...]
        const iN = [0, 0, -1, 1, 0, 0, 0, 0, 1, -1, 0, 0, 0, 1, 0, 0, -1, 0]; //[n0.x, n0.y, n0.z, n1.x, n1.y, n1.z, ...]
        const iT = [1, 1, 0, 1, 0, 0, 1, 0];  //[t0.u, t0.v, t1.u, t1.v ...]
        const iD = [
            0, 2, 0, 1, 2, 1, 2, 2, 2, 0, 2, 0, 2, 2, 2, 3, 2, 3,
            4, 1, 0, 0, 1, 1, 3, 1, 2, 4, 1, 0, 3, 1, 2, 7, 1, 3,
            5, 0, 0, 4, 0, 1, 7, 0, 2, 5, 0, 0, 7, 0, 2, 6, 0, 3,
            1, 3, 0, 5, 3, 1, 6, 3, 2, 1, 3, 0, 6, 3, 2, 2, 3, 3,
            4, 4, 0, 5, 4, 1, 1, 4, 2, 4, 4, 0, 1, 4, 2, 0, 4, 3,
            6, 5, 0, 7, 5, 1, 3, 5, 2, 6, 5, 0, 3, 5, 2, 2, 5, 3]; //[v0.p, v0.n, v0.t, v1.p, v1.n, v1.t, ...] such that gl-trinagle data is generated

        const arr = glObject.decode(iD, iP, iN, iT);
        Cube.p = arr[0];
        Cube.n = arr[1];
        Cube.t = arr[2];
    }

    constructor(index: number) {
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

class Lines extends glObject {
    lines: number[] = [];
    OBO = gl.createBuffer();
    width;
    pos: number[] = [];
    ind: number[] = [];
    col: number[] = [];
    weight: number[] = [];

    constructor(width: number) {
        super(0);
        this.width = width;
    }

    appendGrid(a: number) {
        const color = [1, 1, 1, 0.1];
        const X = [1, 0, 0];
        const Y = [0, 1, 0];
        for (let i = 1; i < a; i++) {
            this.appendLongLine([i, 0, 0], Y, color);
            this.appendLongLine([-i, 0, 0], Y, color);
            this.appendLongLine([0, i, 0], X, color);
            this.appendLongLine([0, -i, 0], X, color);
        }
    }

    /**
     * Appends a long line by adding 10 segments with a length of 10 units in each direction of the given line.
     * @param {vec3} p the origin point of the line
     * @param {vec3} t the tangent (direction) of the line
     * @param {vec4} color the color of the line
     */
    appendLongLine(p: number[], t: number[], color: number[]) {
        let tn = vec3.scalarMul(vec3.normalize(t), 10);
        for (let i = 0; i < 10; i++) {
            this.append(vec3.add(p, vec3.scalarMul(tn, i)).concat(vec3.add(p, vec3.scalarMul(tn, i + 1))), color);
            this.append(vec3.add(p, vec3.scalarMul(tn, -i)).concat(vec3.add(p, vec3.scalarMul(tn, -(i + 1)))), color);
        }
    }

    append(lines: number[], color: number[]) {
        this.lines = this.lines.concat(lines);
        const prev = this.pos.length / 3;
        for (let i = 0; i < lines.length; i += 3) {
            this.pos.push(lines[i], lines[i + 1], lines[i + 2]);
            this.pos.push(lines[i], lines[i + 1], lines[i + 2]);
            this.pos.push(lines[i], lines[i + 1], lines[i + 2]);
            this.col.push(color[0], color[1], color[2], color[3]);
            this.col.push(color[0], color[1], color[2], color[3]);
            this.col.push(color[0], color[1], color[2], color[3]);
            this.weight.push(0, (this.width + 1) / 2, 0);
        }

        for (let i = prev; i < prev + lines.length; i += 6)
            this.ind.push(i + 0, i + 4, i + 3, i + 0, i + 1, i + 4, i + 1, i + 5, i + 4, i + 1, i + 2, i + 5);
    }

    build() {
        this.VAO = gl.createVertexArray();
        gl.bindVertexArray(this.VAO);

        const PBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, PBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.pos), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.OBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.pos.length / 3 * 2), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

        const CBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, CBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.col), gl.STATIC_DRAW);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(2);

        const WBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, WBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.weight), gl.STATIC_DRAW);
        gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(3);

        const IBO = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.ind), gl.STATIC_DRAW);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        this.mode = gl.TRIANGLES;
        this.count = this.ind.length;
    }

    prepAndRender(mat: number[]) {
        const off = [];

        for (let i = 0; i < this.lines.length; i += 6) {
            let p0 = mat4.multVec(mat, [this.lines[i], this.lines[i + 1], this.lines[i + 2], 1]);
            let p1 = mat4.multVec(mat, [this.lines[i + 3], this.lines[i + 4], this.lines[i + 5], 1]);

            let t = vec4.xy(vec4.sub(p1, p0));
            let n = vec2.div(vec2.scalarMul(vec2.normalize([-t[1], t[0]]), (this.width * window.devicePixelRatio + 1) / 2.0), [glCanvas.width, glCanvas.height]);
            off.push(n[0], n[1], 0, 0, -n[0], -n[1]);
            off.push(n[0], n[1], 0, 0, -n[0], -n[1]);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.OBO);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(off));
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.bind();
        this.render();
    }

    render() {
        gl.drawElements(this.mode, this.count, gl.UNSIGNED_INT, 0);
    }
}
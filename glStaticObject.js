"use strict";
class glObject {
    static mode;
    static count;
    static VAO = null;

    static render() {
        gl.drawElements(this.mode, this.count, gl.UNSIGNED_INT, 0);
    }

    static bind() {
        gl.bindVertexArray(this.VAO);
    }

    /**Decodes the given data to an WebGL approbriate formate.
     * @param {number[]} d the index array indexing position, normal, texturecoordinates in this order.
     * @param {number[]} iP the set of positions required for this objct.
     * @param {number[]} iN the set of normals required for this object.
     * @param {number[]} iT the set of texture coordinates required for this object.
     */
    static decode(d, iP, iN, iT) {
        const p = [];
        const n = [];
        const t = [];
        const I = [];

        const map = new Map();

        for (let i = 0; i < d.length; i += 3) {
            const triple = [d[i], d[i + 1], d[i + 2]];
            const tString = triple.toString();
            const got = map.get(tString);

            if (got != undefined) {
                I.push(got);
            } else {
                const mapSize = map.size;
                map.set(tString, mapSize);

                const c3p = 3 * d[i];
                const c3n = 3 * d[i + 1];
                const c2 = 2 * d[i + 2];
                p.push(iP[c3p], iP[c3p + 1], iP[c3p + 2]);
                n.push(iN[c3n], iN[c3n + 1], iN[c3n + 2]);
                t.push(iT[c2], iT[c2 + 1]);
                I.push(mapSize);
            }
        };
        return [p, n, t, I];
    }
}

class Cube extends glObject {
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
        const p = arr[0];
        const n = arr[1];
        const t = arr[2];
        const i = arr[3];

        this.VAO = gl.createVertexArray();
        gl.bindVertexArray(this.VAO);

        const PBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, PBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(p), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        const NBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, NBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(n), gl.STATIC_DRAW);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

        const TCBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, TCBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(t), gl.STATIC_DRAW);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(2);

        const IBO = gl.createBuffer();
        gl.createBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(i), gl.STATIC_DRAW);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.mode = gl.TRIANGLES;
        this.count = i.length;
    }
}
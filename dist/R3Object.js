"use strict";
class R3Objekt {
    constructor(index) {
        this.transformationStack = new TransformationStack();
        this.index = index;
    }
    getWorldLocation() {
        return mat4.getTranslation(this.transformationStack.getTransformationMatrix());
    }
}
class MeshObject extends R3Objekt {
    constructor(index) {
        super(index);
        this.mesh = new Mesh();
        this.VAO = gl.createVertexArray();
        this.VBOs = [];
        this.numVertices = 0;
        const pbo = gl.createBuffer();
        const fnbo = gl.createBuffer();
        const vnbo = gl.createBuffer();
        const guvbo = gl.createBuffer();
        if (!pbo || !fnbo || !vnbo || !guvbo)
            throw new Error("Could not create Buffer in Mesh Object");
        this.VBOs[0] = pbo;
        this.VBOs[1] = fnbo;
        this.VBOs[2] = vnbo;
        this.VBOs[3] = guvbo;
        gl.bindVertexArray(this.VAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, pbo);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, fnbo);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);
        gl.bindBuffer(gl.ARRAY_BUFFER, vnbo);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(2);
        gl.bindBuffer(gl.ARRAY_BUFFER, guvbo);
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(3);
        gl.bindVertexArray(null);
    }
    bindAndRender() {
        gl.bindVertexArray(this.VAO);
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }
    createAndBuildVAO() {
        const pos = [];
        const vn = [];
        const fn = [];
        const guv = [];
        for (const face of this.mesh.faces) {
            const verts = face.vertices;
            for (let i = 1; i < verts.length - 1; i++) {
                pos.push(...verts[0].sharedVertex.sharedVertexAttribs[0], ...verts[i].sharedVertex.sharedVertexAttribs[0], ...verts[i + 1].sharedVertex.sharedVertexAttribs[0]);
                fn.push(...verts[0].vertexAttribs[0], ...verts[i].vertexAttribs[0], ...verts[i + 1].vertexAttribs[0]);
                vn.push(...verts[0].vertexAttribs[1], ...verts[i].vertexAttribs[1], ...verts[i + 1].vertexAttribs[1]);
                guv.push(...verts[0].vertexAttribs[2], ...verts[i].vertexAttribs[2], ...verts[i + 1].vertexAttribs[2]);
            }
        }
        this.numVertices = pos.length / 3;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOs[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOs[1]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fn), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOs[2]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vn), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOs[3]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(guv), gl.STATIC_DRAW);
    }
}
class BasicMesh {
    static appendCube(mo) {
        const mesh = new Mesh();
        mesh.vertices.push(new SharedVertex(1, 1, 1), new SharedVertex(-1, 1, 1), new SharedVertex(-1, -1, 1), new SharedVertex(1, -1, 1), new SharedVertex(1, 1, -1), new SharedVertex(-1, 1, -1), new SharedVertex(-1, -1, -1), new SharedVertex(1, -1, -1));
        mesh.fill([0, 1, 2, 3], [4, 5, 1, 0], [7, 6, 5, 4], [3, 2, 6, 7], [4, 0, 3, 7], [1, 5, 6, 2]);
        mesh.calculateFaceNormals();
        mesh.calculateVertexNormals();
        for (const f of mesh.faces) {
            for (let i = 0; i < f.vertices.length; i++)
                f.vertices[i].vertexAttribs[2] = [Math.floor(Math.abs(i - 1.5)), Math.floor(-i / 2 + 1.75)];
        }
        mo.mesh.append(mesh);
        return mo;
    }
    static appendUVSphere(mo, radius = 1, segments = 32, rings = 16) {
        rings--;
        const mesh = new Mesh();
        const rp1 = rings + 1;
        const rm1 = rings - 1;
        const sm1 = segments - 1;
        for (let t = 1; t <= rings; t++) {
            const theta = t / rp1 * Math.PI - Math.PI;
            for (let f = 0; f < segments; f++) {
                const phi = f * 2 * Math.PI / segments;
                mesh.vertices.push(new SharedVertex(...vec3.sphericalToEuclidian(theta, phi, radius)));
            }
        }
        for (let t = 0; t < rm1; t++) {
            const ringIndex = t * segments;
            for (let s = 0; s < sm1; s++)
                mesh.fill([ringIndex + segments + s + 1, ringIndex + segments + s, ringIndex + s, ringIndex + s + 1]);
            mesh.fill([ringIndex + segments, ringIndex + 2 * segments - 1, ringIndex + segments - 1, ringIndex]);
        }
        const lfi = mesh.vertices.length - segments;
        mesh.vertices.push(new SharedVertex(0, 0, -radius));
        mesh.vertices.push(new SharedVertex(0, 0, radius));
        for (let s = 0; s < sm1; s++)
            mesh.fill([s + 1, s, mesh.vertices.length - 2]);
        mesh.fill([0, segments - 1, mesh.vertices.length - 2]);
        for (let s = 0; s < sm1; s++)
            mesh.fill([mesh.vertices.length - 1, lfi + s, lfi + s + 1]);
        mesh.fill([mesh.vertices.length - 1, lfi + segments - 1, lfi]);
        mesh.calculateFaceNormals();
        mesh.calculateVertexNormals();
        for (const f of mesh.faces) {
            for (let i = 0; i < f.vertices.length; i++)
                f.vertices[i].vertexAttribs[2] = [0, 0];
        }
        mo.mesh.append(mesh);
        return mo;
    }
    static appendZFunktion(mo, fun, uStart = -8, uEnd = 8, vStart = -8, vEnd = 8, uRes = 128, vRes = 128, nan = 0) {
        const mesh = new Mesh();
        for (let V = 0; V <= vRes; V++) {
            const v = vStart + V / vRes * (vEnd - vStart);
            for (let U = 0; U <= uRes; U++) {
                const u = uStart + U / uRes * (uEnd - uStart);
                const z = fun(u, v);
                mesh.pushSharedVertex(u, v, isNaN(z) ? nan : z);
            }
        }
        for (let V = 0; V < vRes; V++) {
            for (let U = 0; U < uRes; U++) {
                const i = V * (vRes + 1) + U;
                mesh.fill([i + vRes + 1 + 1, i + vRes + 1, i, i + 1]);
            }
        }
        mesh.calculateFaceNormals();
        mesh.calculateVertexNormals();
        for (const f of mesh.faces) {
            for (let i = 0; i < f.vertices.length; i++)
                f.vertices[i].vertexAttribs[2] = [0, 0];
        }
        mo.mesh.append(mesh);
        return mo;
    }
    static appendTorus(mo, ri = 1, ro = 0.5, outerRes = 32, innerRes = 16) {
        return this.appendXYZFunktion(mo, (u, v) => {
            const rm = (ri + ro) / 2;
            const rc = (ri - ro) / 2;
            return [
                Math.cos(u) * (rm + Math.cos(v) * rc),
                -Math.sin(v) * rc,
                Math.sin(u) * (rm + Math.cos(v) * rc)
            ];
        }, 0, 2 * Math.PI, 0, 2 * Math.PI, outerRes, innerRes, true, true);
    }
    static appendCone(mo, br, height, res) {
        const mesh = new Mesh;
        for (let i = 0; i < res; i++) {
            const angle = i / res * 2 * Math.PI;
            mesh.pushSharedVertex(Math.cos(angle) * br, Math.sin(angle) * br, 0);
        }
        mesh.pushSharedVertex(0, 0, height);
        for (let i = 0; i < res; i++)
            mesh.fill([res, i, (i + 1) % res]);
        mesh.calculateFaceNormals();
        mesh.calculateVertexNormals();
        for (const f of mesh.faces) {
            for (let i = 0; i < f.vertices.length; i++)
                f.vertices[i].vertexAttribs[2] = [0, 0];
        }
        mo.mesh.append(mesh);
        return mo;
    }
    static appendXYZFunktion(mo, fun, uStart = -8, uEnd = 8, vStart = -8, vEnd = 8, uRes = 64, vRes = 64, uClosing = false, vClosing = false) {
        const mesh = new Mesh();
        const uRange = uEnd - uStart;
        const vRange = vEnd - vStart;
        const maxU = uClosing ? uRes - 1 : uRes;
        const maxV = vClosing ? vRes - 1 : vRes;
        for (let V = 0; V <= maxV; V++) {
            const v = vStart + V / vRes * vRange;
            for (let U = 0; U <= maxU; U++) {
                const u = uStart + U / uRes * uRange;
                mesh.pushSharedVertex(...fun(u, v));
            }
        }
        for (let V = 0; V < maxV; V++) {
            for (let U = 0; U < maxU; U++) {
                const i = V * (maxU + 1) + U;
                mesh.fill([i + maxU + 1 + 1, i + maxU + 1, i, i + 1]);
            }
        }
        if (uClosing) {
            const maxUp1 = maxU + 1;
            for (let i = 0; i < maxV; i++) {
                mesh.fill([(i + 1) * maxUp1, (i + 2) * maxUp1 - 1, i * maxUp1 + maxU, i * (maxU + 1)]);
            }
        }
        if (vClosing) {
            const m = (maxU + 1) * maxV;
            for (let i = 0; i < maxU; i++) {
                mesh.fill([i + 1, i, m + i, m + i + 1]);
            }
        }
        if (uClosing && vClosing)
            mesh.fill([0, maxU, (maxU + 1) * (maxV + 1) - 1, (maxU + 1) * maxV]);
        mesh.calculateFaceNormals();
        mesh.calculateVertexNormals();
        for (const f of mesh.faces) {
            for (let i = 0; i < f.vertices.length; i++)
                f.vertices[i].vertexAttribs[2] = [0, 0];
        }
        mo.mesh.append(mesh);
        return mo;
    }
}

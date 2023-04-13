"use strict";
class Vertex {
    constructor(sharedVertex, face) {
        this.vertexAttribs = [];
        sharedVertex.children.push(this);
        this.sharedVertex = sharedVertex;
        this._face = face;
    }
    interpolateTo(v, svs, inOrder) {
        const num = svs.length;
        const np1 = num + 1;
        const inof = this.face.vertices.indexOf(this);
        if (inOrder) {
            for (let i = 1; i <= num; i++) {
                const nv = new Vertex(svs[i - 1], this.face);
                nv.vertexAttribs = VecX.mixArrays(this.vertexAttribs, v.vertexAttribs, i / np1);
                this.face.vertices.splice(inof + i, 0, nv);
            }
        }
        else {
            for (let i = 1; i <= num; i++) {
                const nv = new Vertex(svs[num - i], this.face);
                nv.vertexAttribs = VecX.mixArrays(this.vertexAttribs, v.vertexAttribs, i / np1);
                this.face.vertices.splice(inof + i, 0, nv);
            }
        }
    }
    get face() {
        return this._face;
    }
}
class SharedVertex {
    constructor(...pos) {
        this.children = [];
        this.sharedEdges = new Set;
        this.sharedVertexAttribs = [pos];
    }
    getAdjecentFaces() {
        const faces = new Set();
        for (const vert of this.children)
            if (vert.face)
                faces.add(vert.face);
        return Array.from(faces);
    }
    findSharedEdgeTo(sv) {
        for (const se of this.sharedEdges)
            if (se.equals(this, sv))
                return se;
        return null;
    }
    interpolateTo(sv, num) {
        const verts = [];
        const np1 = num + 1;
        for (let i = 1; i <= num; i++) {
            const nsv = new SharedVertex(0, 0, 0);
            nsv.sharedVertexAttribs = VecX.mixArrays(this.sharedVertexAttribs, sv.sharedVertexAttribs, i / np1);
            verts.push(nsv);
        }
        return verts;
    }
    associateToSharedEdge(se) {
        this.sharedEdges.add(se);
    }
    disconnectFromSharedEdge(se) {
        this.sharedEdges.delete(se);
    }
}
class Edge {
    constructor(v1, v2, isSharedOrder) {
        this.v1 = v1;
        this.v2 = v2;
        this.isSharedOrder = isSharedOrder;
    }
    get face() {
        return this.v1.face;
    }
    interpolateAndAssigne(nsv) {
        this.v1.interpolateTo(this.v2, nsv, this.isSharedOrder);
    }
}
class SharedEdge {
    constructor(sharedVertex1, sharedVertex2) {
        this.sv1 = sharedVertex1;
        this.sv2 = sharedVertex2;
        sharedVertex1.associateToSharedEdge(this);
        sharedVertex2.associateToSharedEdge(this);
    }
    static connect(...svs) {
        const SEs = [];
        for (let i = 1; i < svs.length; i++)
            SEs.push(new SharedEdge(svs[i - 1], svs[i]));
        return SEs;
    }
    getEdges() {
        const edges = [];
        for (const v of this.sv1.children) {
            const e = v.face.findEdge(v, this.sv2);
            if (e)
                edges.push(e);
        }
        return edges;
    }
    subdivide(cuts) {
        const newSVs = this.sv1.interpolateTo(this.sv2, cuts);
        const newSEs = SharedEdge.connect(this.sv1, ...newSVs, this.sv2);
        for (const e of this.getEdges())
            e.interpolateAndAssigne(newSVs);
        this.sv1.disconnectFromSharedEdge(this);
        this.sv2.disconnectFromSharedEdge(this);
        return { newSVs, newSEs };
    }
    equals(v1, v2) {
        return this.sv1 === v1 && this.sv2 === v2 || this.sv1 === v2 && this.sv2 === v1;
    }
}
class Face {
    constructor() {
        this.vertices = [];
    }
    findEdge(v1, sv) {
        const v1i = this.vertices.indexOf(v1);
        if (v1i == -1)
            throw new Error("FATAL: could not find vertex");
        let other = this.vertices[(v1i + 1) % this.vertices.length];
        if (sv.children.indexOf(other) != -1)
            return new Edge(v1, other, true);
        other = this.vertices[modulo(v1i - 1, this.vertices.length)];
        if (sv.children.indexOf(other) != -1)
            return new Edge(other, v1, false);
        return undefined;
    }
    getNormal() {
        const T = vec3.sub(this.vertices[1].sharedVertex.sharedVertexAttribs[0], this.vertices[0].sharedVertex.sharedVertexAttribs[0]);
        const B = vec3.sub(this.vertices[2].sharedVertex.sharedVertexAttribs[0], this.vertices[0].sharedVertex.sharedVertexAttribs[0]);
        return vec3.normalize(vec3.cross(T, B));
    }
}
class Mesh {
    constructor() {
        this.faces = [];
        this.edges = [];
        this.vertices = [];
    }
    pushSharedVertex(...pos) {
        this.vertices.push(new SharedVertex(...pos));
    }
    getOrCreateSharedEdge(v1, v2) {
        let se = v1.findSharedEdgeTo(v2);
        if (se)
            return se;
        se = new SharedEdge(v1, v2);
        this.edges.push(se);
        return se;
    }
    subdivideEdges(cuts) {
        const newSE = [];
        for (const se of this.edges) {
            const data = se.subdivide(cuts);
            this.vertices.push(...data.newSVs);
            newSE.push(...data.newSEs);
        }
        this.edges = newSE;
    }
    castToSphere(r = 1) {
        for (const v of this.vertices)
            v.sharedVertexAttribs[0] = vec3.scalarMul(vec3.normalize(v.sharedVertexAttribs[0]), r);
        this.calculateFaceNormals();
        this.calculateVertexNormals();
    }
    fill(...indices) {
        for (const inArr of indices) {
            if (inArr.length < 2)
                return;
            if (inArr.length == 2) {
                const sv1 = this.vertices[inArr[0]];
                const sv2 = this.vertices[inArr[1]];
                this.getOrCreateSharedEdge(sv1, sv2);
                return;
            }
            const face = new Face();
            for (let i = 0; i < inArr.length; i++) {
                const sv1 = this.vertices[inArr[i]];
                const sv2 = this.vertices[inArr[(i + 1) % inArr.length]];
                const se = this.getOrCreateSharedEdge(sv1, sv2);
                face.vertices.push(new Vertex(sv1, face));
            }
            this.faces.push(face);
        }
    }
    calculateFaceNormals() {
        for (const face of this.faces) {
            const N = face.getNormal();
            for (const vert of face.vertices)
                vert.vertexAttribs[0] = N;
        }
    }
    calculateVertexNormals() {
        for (const vert of this.vertices) {
            const faces = vert.getAdjecentFaces();
            let normal = [0, 0, 0];
            for (const face of faces) {
                normal = vec3.add(normal, face.getNormal());
            }
            normal = vec3.normalize(normal);
            for (const v of vert.children)
                v.vertexAttribs[1] = normal;
        }
    }
    append(mesh) {
        this.vertices = this.vertices.concat(mesh.vertices);
        this.edges = this.edges.concat(mesh.edges);
        this.faces = this.faces.concat(mesh.faces);
    }
}

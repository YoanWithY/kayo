"use strict";
class R3Objekt {
    constructor() {
        this.transformationStack = new TransformationStack();
    }
    getWorldLocation() {
        return mat4.getTranslation(this.transformationStack.getTransformationMatrix());
    }
}
class MeshObject extends R3Objekt {
    constructor() {
        super(...arguments);
        this.faces = [];
        this.edges = [];
        this.vertices = [];
    }
    render() {
    }
    findSharedEdge(v1, v2) {
        for (const se of this.edges)
            if (se.equals(v1, v2))
                return se;
        return null;
    }
    getOrCreateSharedEdge(v1, v2) {
        let se = this.findSharedEdge(v1, v2);
        if (se)
            return se;
        se = new SharedEdge(v1, v2);
        this.edges.push(se);
        return se;
    }
    fill(...indices) {
        if (indices.length < 2)
            return;
        if (indices.length == 2) {
            const sv1 = this.vertices[indices[0]];
            const sv2 = this.vertices[indices[1]];
            this.getOrCreateSharedEdge(sv1, sv2);
            return;
        }
        const arr = [];
        for (let i = 0; i < indices.length; i++) {
            const sv1 = this.vertices[indices[i]];
            const sv2 = this.vertices[indices[(i + 1) % indices.length]];
            const se = this.getOrCreateSharedEdge(sv1, sv2);
            arr.push(new Vertex(sv1));
        }
        this.faces.push(new Face(...arr));
    }
    append(vertices, edges, faces) {
        const ci = this.vertices.length;
        for (const v of vertices)
            this.vertices.push(v);
        for (const arr of faces) {
            this.fill(...VecX.scalarAdd(arr, ci));
        }
    }
}
class BasicMesh {
    static appendCube(mo) {
        mo.append([
            new SharedVertex(1, 1, 1),
            new SharedVertex(-1, 1, 1),
            new SharedVertex(-1, -1, 1),
            new SharedVertex(1, -1, 1),
            new SharedVertex(1, 1, -1),
            new SharedVertex(-1, 1, -1),
            new SharedVertex(-1, -1, -1),
            new SharedVertex(1, -1, -1)
        ], [], [
            [0, 1, 2, 3],
            [4, 5, 1, 0],
            [7, 6, 5, 4],
            [3, 2, 6, 7],
            [4, 0, 3, 7],
            [1, 5, 6, 2]
        ]);
    }
}

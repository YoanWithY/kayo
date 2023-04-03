
class R3Objekt {
    transformationStack;

    constructor() {
        this.transformationStack = new TransformationStack();
    }

    getWorldLocation() {
        return mat4.getTranslation(this.transformationStack.getTransformationMatrix());
    }
}

class MeshObject extends R3Objekt {

    faces: Face[] = [];
    edges: SharedEdge[] = [];
    vertices: SharedVertex[] = [];

    render() {

    }

    /**
     * Returns a SharedEdge that contains the exact (===) arguments v1 and v2 . Order does not matter.
     * @param v1 the first SharedVertex to look for
     * @param v2 the second SharedVertex to look for
     * @returns the SharedEdge found or `null` if this SharedEdge does not exist.
     */
    findSharedEdge(v1: SharedVertex, v2: SharedVertex) {
        for (const se of this.edges)
            if (se.equals(v1, v2))
                return se;
        return null;
    }

    /**
     * Returns either the SharedEdge that matches the arguments or a new SharedEdeg constructed by the arguments.
     * @param v1 
     * @param v2 
     * @returns either the SharedEdge that matches the arguments or a new SharedEdeg constructed by the arguments
     */
    getOrCreateSharedEdge(v1: SharedVertex, v2: SharedVertex) {
        let se = this.findSharedEdge(v1, v2);
        if (se)
            return se;
        se = new SharedEdge(v1, v2);
        this.edges.push(se);
        return se;
    }

    fill(...indices: number[]) {
        if (indices.length < 3)
            return;

        for (let i = 0; i < indices.length - 1; i++) {
            const sv1 = this.vertices[indices[i]];
            const sv2 = this.vertices[indices[i + 1]];
            const se = this.getOrCreateSharedEdge(sv1, sv2);
            const v1 = new Vertex(sv1);
            const v2 = new Vertex(sv2);
            const e1 = new Edge(se, v1, v2);
        }
    }
}

class BasicMesh {
    static appendCube(mo: MeshObject) {
        const ci = mo.vertices.length;
        mo.vertices.push(
            new SharedVertex(1, 1, 1),
            new SharedVertex(-1, 1, 1),
            new SharedVertex(-1, -1, 1),
            new SharedVertex(1, -1, 1),
            new SharedVertex(1, 1, -1),
            new SharedVertex(-1, 1, -1),
            new SharedVertex(-1, -1, -1),
            new SharedVertex(1, -1, -1));
        mo.fill(ci + 0, ci + 1, ci + 2, ci + 3);
        mo.fill(ci + 4, ci + 5, ci + 1, ci + 0);
        mo.fill(ci + 7, ci + 6, ci + 5, ci + 4);
        mo.fill(ci + 3, ci + 2, ci + 6, ci + 7);
        mo.fill(ci + 4, ci + 0, ci + 3, ci + 7);
        mo.fill(ci + 1, ci + 5, ci + 6, ci + 2);
    }
}

interface Camera {
    getProjectionMatrix(): number[];
    getViewMatrix(): number[];
    getWorldLocation(): number[];
}

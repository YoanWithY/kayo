class Vertex {
    sharedVertex: SharedVertex;
    face: Face | null;

    /**
     * Array of all vector-values for vertex attributes that this Verex holds.
     * 
     * [0] = Face Normal
     * 
     * [1] = Vertex Normal
     * 
     * [2] = generated UV
     */
    vertexAttribs: number[][] = [];

    /**
     * Constructs a `Vertex` and establishes the required assoziations.
     * @param sharedVertex the parent
     * @param face the face the vertex holds data for
     */
    constructor(sharedVertex: SharedVertex, face: Face | null = null) {
        sharedVertex.children.push(this);
        this.sharedVertex = sharedVertex;
        this.face = face;
    }
}

class SharedVertex {
    children: Vertex[] = [];

    /**
     * Array of all vector-values for shared vertex attributes that this SharedVertex holds. 
     */
    sharedVertexAttribs: number[][] = [];
    sharedEdges: SharedEdge[];

    constructor(x: number, y: number, z: number, sharedEdges: SharedEdge[] = []) {
        this.sharedEdges = sharedEdges;
        this.sharedVertexAttribs[0] = [x, y, z];
    }

    getAdjecentFaces() {
        const faces: Set<Face> = new Set();
        for (const vert of this.children)
            if (vert.face)
                faces.add(vert.face);

        return Array.from(faces);
    }


}

class SharedEdge {
    sharedVertex1: SharedVertex;
    sharedVertex2: SharedVertex;

    constructor(sharedVertex1: SharedVertex, sharedVertex2: SharedVertex) {
        this.sharedVertex1 = sharedVertex1;
        this.sharedVertex2 = sharedVertex2;
    }

    equals(v1: SharedVertex, v2: SharedVertex) {
        return this.sharedVertex1 === v1 && this.sharedVertex2 === v2 || this.sharedVertex1 === v2 && this.sharedVertex2 === v1;
    }
}

class Face {
    vertices: Vertex[]

    /**
     * Constructs a `Face` from `Vertices`
     * @param vertices should contain at least 3 elemets (we trust the user and do not check against this constraint).
     */
    constructor(...vertices: Vertex[]) {
        this.vertices = vertices;
    }

    getNormal() {
        const T = vec3.sub(this.vertices[1].sharedVertex.sharedVertexAttribs[0], this.vertices[0].sharedVertex.sharedVertexAttribs[0]);
        const B = vec3.sub(this.vertices[2].sharedVertex.sharedVertexAttribs[0], this.vertices[0].sharedVertex.sharedVertexAttribs[0]);
        return vec3.normalize(vec3.cross(T, B));
    }
}


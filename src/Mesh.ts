class Vertex {
    sharedVertex: SharedVertex;
    edge1: Edge | null;
    edge2: Edge | null;

    /**
     * Array of all vector-values for vertex attributes that this Verex holds.
     */
    vertexAttribs: number[][] = [];

    constructor(sharedVertex: SharedVertex, edge1: Edge | null = null, edge2: Edge | null = null) {
        this.sharedVertex = sharedVertex;
        this.vertexAttribs[0] = [0, 0, 0];
        this.edge1 = edge1;
        this.edge2 = edge2;
    }
}

class Edge {
    vertex1: Vertex;
    vertex2: Vertex;
    sharedEdge: SharedEdge;

    constructor(sharedEdge: SharedEdge, vertex1: Vertex, vertex2: Vertex) {
        this.sharedEdge = sharedEdge;
        this.vertex1 = vertex1;
        this.vertex2 = vertex2;
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


}

class SharedEdge {
    children: Edge[];
    sharedVertex1: SharedVertex;
    sharedVertex2: SharedVertex;

    constructor(sharedVertex1: SharedVertex, sharedVertex2: SharedVertex, children: Edge[] = []) {
        this.sharedVertex1 = sharedVertex1;
        this.sharedVertex2 = sharedVertex2;
        this.children = children;
    }

    equals(v1: SharedVertex, v2: SharedVertex) {
        return this.sharedVertex1 === v1 && this.sharedVertex2 === v2 || this.sharedVertex1 === v2 && this.sharedVertex2 === v1;
    }
}

class Face {
    vertices: Vertex[]
    constructor(vertex0: Vertex, vertex1: Vertex, vertex2: Vertex, ...vertices: Vertex[]) {
        this.vertices = [vertex0, vertex1, vertex2].concat(vertices);
    }
}


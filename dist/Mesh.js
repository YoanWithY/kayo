"use strict";
class Vertex {
    constructor(sharedVertex, edge1 = null, edge2 = null) {
        this.vertexAttribs = [];
        this.sharedVertex = sharedVertex;
        this.vertexAttribs[0] = [0, 0, 0];
        this.edge1 = edge1;
        this.edge2 = edge2;
    }
}
class Edge {
    constructor(sharedEdge, vertex1, vertex2) {
        this.sharedEdge = sharedEdge;
        this.vertex1 = vertex1;
        this.vertex2 = vertex2;
    }
}
class SharedVertex {
    constructor(sharedEdges = []) {
        this.children = [];
        this.sharedVertexAttribs = [];
        this.sharedEdges = sharedEdges;
    }
}
class SharedEdge {
    constructor(sharedVertex1, sharedVertex2, children = []) {
        this.sharedVertex1 = sharedVertex1;
        this.sharedVertex2 = sharedVertex2;
        this.children = children;
    }
}
class Face {
    constructor(edge1, edge2, edge3, ...edges) {
        this.edges = [edge1, edge2, edge3].concat(edges);
    }
}

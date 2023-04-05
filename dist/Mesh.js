"use strict";
class Vertex {
    constructor(sharedVertex, face = null) {
        this.vertexAttribs = [];
        sharedVertex.children.push(this);
        this.sharedVertex = sharedVertex;
        this.face = face;
    }
}
class SharedVertex {
    constructor(x, y, z, sharedEdges = []) {
        this.children = [];
        this.sharedVertexAttribs = [];
        this.sharedEdges = sharedEdges;
        this.sharedVertexAttribs[0] = [x, y, z];
    }
}
class SharedEdge {
    constructor(sharedVertex1, sharedVertex2) {
        this.sharedVertex1 = sharedVertex1;
        this.sharedVertex2 = sharedVertex2;
    }
    equals(v1, v2) {
        return this.sharedVertex1 === v1 && this.sharedVertex2 === v2 || this.sharedVertex1 === v2 && this.sharedVertex2 === v1;
    }
}
class Face {
    constructor(...vertices) {
        this.vertices = vertices;
    }
}

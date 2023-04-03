"use strict";
class SharedVerex {
    constructor() {
        this.children = [];
        this.sharedVertexAttrib = [];
    }
}
class Vertex {
    constructor(parent) {
        this.parent = parent;
    }
}

class Vertex {
    /**
     * The {@link SharedVertex} this Vertex is assoziated to.
     */
    private readonly _sharedVertex: SharedVertex;
    private readonly _face: Face;

    vertexNormal = vec3.X;
    generatedUV = vec2.null;
    vertexAttribs: number[][] = [];

    /**
     * The next vertex in the cyclic doubly linked list.
     */
    next: Vertex = {} as Vertex;

    /**
     * The previous vertex in the cyclic doubly linked list.
     */
    prev: Vertex = {} as Vertex;

    /**
     * Constructs a `Vertex` and establishes the required assoziations.
     * @param sharedVertex the parent
     * @param face the face the vertex holds data for
     */
    constructor(sharedVertex: SharedVertex, face: Face) {
        sharedVertex.children.push(this);
        this._sharedVertex = sharedVertex;
        this._face = face;
    }

    /**
     * Getter for the {@link SharedVertex} of this Vertex.
     */
    get sharedVertex() {
        return this._sharedVertex;
    }

    get position() {
        return this._sharedVertex.va_position;
    }

    get faceNormal() {
        return this._face.normal;
    }

    get face() {
        return this._face;
    }

}

/**
 * A SharedVertex represents a set of Vertices and stores shared vertex attribs for those vertices that are assoziated
 * with this 
 */
class SharedVertex {
    children: Vertex[] = [];

    va_position = vec3.null;

    /**
     * The {@link SharedEdges} this {@link SharedVertex} is assoziated to.
     */
    private sharedEdges: Set<SharedEdge> = new Set;

    constructor(pos: vec3) {
        this.va_position = pos;
    }

    findSharedEdgeTo(sv: SharedVertex) {
        for (const se of this.sharedEdges)
            if (se.equals(this, sv))
                return se;
        return null;
    }

    associateToSharedEdge(se: SharedEdge) {
        this.sharedEdges.add(se);
    }

    disconnectFromSharedEdge(se: SharedEdge) {
        this.sharedEdges.delete(se);
    }
}

class SharedEdge {
    sv1: SharedVertex;
    sv2: SharedVertex;

    constructor(sharedVertex1: SharedVertex, sharedVertex2: SharedVertex) {
        this.sv1 = sharedVertex1;
        this.sv2 = sharedVertex2;
        sharedVertex1.associateToSharedEdge(this);
        sharedVertex2.associateToSharedEdge(this);
    }

    static connect(...svs: SharedVertex[]) {
        const SEs: SharedEdge[] = [];
        for (let i = 1; i < svs.length; i++)
            SEs.push(new SharedEdge(svs[i - 1], svs[i]));
        return SEs;
    }

    /**
     * Returns if this SharedEdge equals a connection between ``sv1`` and ``sv2``.
     * This evaluation is order independent.
     * @param v1 the first SharedVertex
     * @param v2 tge second SharedVertex
     * @returns the result of the evaluation
     */
    equals(v1: SharedVertex, v2: SharedVertex) {
        return this.sv1 === v1 && this.sv2 === v2 || this.sv1 === v2 && this.sv2 === v1;
    }
}

/**
 * A Face represents a tuple of {@link Vertex}s.
 * It provides functionalies realated to the geometrical idea of a Face as well as functionalities to traverse the
 * Mesh data structure.
 */
class Face {
    private readonly _vertices: Vertex[] = [];
    private _normal = vec3.X;
    private _avg = vec3.null;

    private updateBufferedInfo() {
        this._avg = vec3.null;
        for (const vert of this._vertices) {
            this._avg.x += vert.position.x;
            this._avg.y += vert.position.y;
            this._avg.z += vert.position.z;
        }
    }

    addVertex(v: Vertex) {
        if (this._vertices.indexOf(v) === -1)
            return;

        this._vertices.push(v);
        this.updateBufferedInfo();
    }

    get normal() {
        return this._normal;
    }

    get avg() {
        return this._avg;
    }
}

class Mesh {
    faces: Face[] = [];
    edges: SharedEdge[] = [];
    vertices: SharedVertex[] = [];

    pushSharedVertex(pos: vec3) {
        this.vertices.push(new SharedVertex(pos));
    }

    /**
     * @param v1 
     * @param v2 
     * @returns either the SharedEdge that matches the arguments or a new SharedEdge constructed by the arguments
     */
    getOrCreateSharedEdge(v1: SharedVertex, v2: SharedVertex) {
        let se = v1.findSharedEdgeTo(v2);
        if (se)
            return se;
        se = new SharedEdge(v1, v2);
        this.edges.push(se);
        return se;
    }

    subdivideEdges(cuts: number) {
        const newSE: SharedEdge[] = [];

        for (const se of this.edges) {
            const data = se.subdivide(cuts);
            this.vertices.push(...data.newSVs);
            newSE.push(...data.newSEs);
        }
        this.edges = newSE;
    }

    castToSphere(r: number = 1) {
        for (const v of this.vertices)
            v.va_position = vec3.scalarMul(vec3.normalize(v.va_position), r);
        this.calculateFaceNormals();
        this.calculateVertexNormals();
    }

    fill(...indices: number[][]) {
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
            let normal: vec3 = [0, 0, 0];
            for (const face of faces) {
                normal = vec3.add(normal, face.getNormal());
            }
            normal = vec3.normalize(normal);
            for (const v of vert.children)
                v.vertexAttribs[1] = normal;
        }
    }

    append(mesh: Mesh) {
        this.vertices = this.vertices.concat(mesh.vertices);
        this.edges = this.edges.concat(mesh.edges);
        this.faces = this.faces.concat(mesh.faces);
    }
}
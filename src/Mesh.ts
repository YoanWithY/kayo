class Vertex {
    /**
     * The SharedVertex this Vertex is assoziated to.
     */
    sharedVertex: SharedVertex;

    /**
     * The {@link Face} this Vertex is assoziated to.
     */
    private _face: Face;

    /**
     * Array of all vector-values for vertex attributes that this Verex holds.
     * 1. Face Normal
     * 2. Vertex Normal
     * 3. generated UV
     */
    vertexAttribs: number[][] = [];

    /**
     * Constructs a `Vertex` and establishes the required assoziations.
     * @param sharedVertex the parent
     * @param face the face the vertex holds data for
     */
    constructor(sharedVertex: SharedVertex, face: Face) {
        sharedVertex.children.push(this);
        this.sharedVertex = sharedVertex;
        this._face = face;
    }

    /**
     * Generates ``svs.length`` Vertices with interpolated vertex attribs by interpolating from this Vertex to v
     * @param v the vertex to interpolate to
     * @param svs the SharedVertices to assigne the vertices to
     * @param inOrder whether the SharedVertices are in the order of the interpolation
     */
    interpolateTo(v: Vertex, svs: SharedVertex[], inOrder: boolean) {
        const num = svs.length;
        const np1 = num + 1;
        const inof = this.face.vertices.indexOf(this);
        if (inOrder) {
            for (let i = 1; i <= num; i++) {
                const nv = new Vertex(svs[i - 1], this.face);
                nv.vertexAttribs = VecX.mixArrays(this.vertexAttribs, v.vertexAttribs, i / np1);
                this.face.vertices.splice(inof + i, 0, nv);
            }
        } else {
            for (let i = 1; i <= num; i++) {
                const nv = new Vertex(svs[num - i], this.face);
                nv.vertexAttribs = VecX.mixArrays(this.vertexAttribs, v.vertexAttribs, i / np1);
                this.face.vertices.splice(inof + i, 0, nv);
            }
        }
    }

    /**
     * Getter for the Face of this Vertex.
     */
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

    /**
     * Array of all vector-values for SharedVertex attributes that this SharedVertex holds. 
     */
    sharedVertexAttribs: [VEC3, ...number[][]];

    /**
     * The {@link SharedEdges} this {@link SharedVertex} is assoziated to.
     */
    private sharedEdges: Set<SharedEdge> = new Set;

    constructor(...pos: VEC3) {
        this.sharedVertexAttribs = [pos];
    }

    getAdjecentFaces() {
        const faces: Set<Face> = new Set();
        for (const vert of this.children)
            if (vert.face)
                faces.add(vert.face);
        return Array.from(faces);
    }

    findSharedEdgeTo(sv: SharedVertex) {
        for (const se of this.sharedEdges)
            if (se.equals(this, sv))
                return se;
        return null;
    }

    interpolateTo(sv: SharedVertex, num: number) {
        const verts: SharedVertex[] = [];
        const np1 = num + 1;
        for (let i = 1; i <= num; i++) {
            const nsv = new SharedVertex(0, 0, 0);
            nsv.sharedVertexAttribs = VecX.mixArrays(this.sharedVertexAttribs, sv.sharedVertexAttribs, i / np1) as [VEC3, ...number[][]];
            verts.push(nsv);
        }
        return verts;
    }

    associateToSharedEdge(se: SharedEdge) {
        this.sharedEdges.add(se);
    }

    disconnectFromSharedEdge(se: SharedEdge) {
        this.sharedEdges.delete(se);
    }
}

/**
 * An Edge represents a connection between two Vertices. Edges are not part of the {@link Mesh} data structure.
 * Edges are used as a temporary data container that simplify algorithms that operate on edges.
 */
class Edge {
    v1;
    v2;
    isSharedOrder;

    constructor(v1: Vertex, v2: Vertex, isSharedOrder: boolean) {
        this.v1 = v1;
        this.v2 = v2;
        this.isSharedOrder = isSharedOrder;
    }

    /**
     * Getter for the {@link Face} that this {@link Edge} is conceptually part of.
     */
    get face() {
        return this.v1.face;
    }

    interpolateAndAssigne(nsv: SharedVertex[]) {
        this.v1.interpolateTo(this.v2, nsv, this.isSharedOrder);
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
     * Finds all edges that are wrapped implicitly by this SharedEdge.
     * @returns the found edges
     */
    getEdges() {
        const edges: Edge[] = [];
        for (const v of this.sv1.children) {
            const e = v.face.findEdge(v, this.sv2);
            if (e)
                edges.push(e);
        }
        return edges;
    }

    /**
     * Subdivdes the SharedEdge by:
     * 1. generate `cuts` SharedVertices by interpolation
     * 2. generate the SharedEdges by connecting from sv1 over the new svs to sv2
     * 3. find all edges that are wrapped implcitly by this SharedEdge
     * 4. for each found Edge generate `cuts` vertices and associate them the the respective
     * SharedVertex generated bevor
     * 5. delete the assosiation of sv1 and sv2 with this Edge
     * 
     * @param cuts the number of vertices to generate between sv1 and sv2
     * @returns the new shared verices and SharedEdges
     */
    subdivide(cuts: number) {
        const newSVs = this.sv1.interpolateTo(this.sv2, cuts);
        const newSEs = SharedEdge.connect(this.sv1, ...newSVs, this.sv2);
        for (const e of this.getEdges())
            e.interpolateAndAssigne(newSVs);
        this.sv1.disconnectFromSharedEdge(this);
        this.sv2.disconnectFromSharedEdge(this);
        return { newSVs, newSEs };
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
    vertices: Vertex[] = [];

    /**
     * Constructs an empty {@link Face}. Bevor used in the {@link Mesh} it should contain at leas 3 {@link Vertex}s.
     */
    constructor() {
    }

    /**
     * Findes the {@link Edge} that contains v1 and a respective {@link Vertex} sv.
     * If no Edge was found undefined is returned.
     * The Edge is returned with vertices in order with respect to the face's winding.
     * @param v1 
     * @param sv 
     * @returns 
     */
    findEdge(v1: Vertex, sv: SharedVertex) {
        const v1i = this.vertices.indexOf(v1);
        if (v1i == -1) // FATAl: could not find v1 in this face
            throw new Error("FATAL: could not find vertex");

        let other = this.vertices[(v1i + 1) % this.vertices.length]; // get the next vertex in the face
        if (sv.children.indexOf(other) != -1) // if other is in the SharedVertex we found the Edge
            return new Edge(v1, other, true);

        other = this.vertices[modulo(v1i - 1, this.vertices.length)]; // get the previous vertex in the face
        if (sv.children.indexOf(other) != -1) // if other is in the SharedVertex we found the Edge, but in 
            return new Edge(other, v1, false);

        return undefined;
    }

    getNormal() {
        const T = vec3.sub(
            this.vertices[1].sharedVertex.sharedVertexAttribs[0],
            this.vertices[0].sharedVertex.sharedVertexAttribs[0]);
        const B = vec3.sub(
            this.vertices[2].sharedVertex.sharedVertexAttribs[0],
            this.vertices[0].sharedVertex.sharedVertexAttribs[0]);
        return vec3.normalize(vec3.cross(T, B));
    }
}

class Mesh {
    faces: Face[] = [];
    edges: SharedEdge[] = [];
    vertices: SharedVertex[] = [];

    pushSharedVertex(...pos: VEC3) {
        this.vertices.push(new SharedVertex(...pos));
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
            v.sharedVertexAttribs[0] = vec3.scalarMul(vec3.normalize(v.sharedVertexAttribs[0]), r);
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
            let normal: VEC3 = [0, 0, 0];
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
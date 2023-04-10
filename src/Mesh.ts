class Vertex {
    sharedVertex: SharedVertex;
    face: Face;

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
    constructor(sharedVertex: SharedVertex, face: Face) {
        sharedVertex.children.push(this);
        this.sharedVertex = sharedVertex;
        this.face = face;
    }

    interpolateTo(v: Vertex, svs: SharedVertex[], inOrder: boolean) {
        const num = svs.length;
        const np1 = num + 1;
        for (let i = 1; i <= num; i++) {
            const nv = new Vertex(svs[inOrder ? i - 1 : num - i], this.face);
            nv.vertexAttribs = VecX.mixArrays(this.vertexAttribs, v.vertexAttribs, i / np1);
        }
    }
}

class SharedVertex {
    children: Vertex[] = [];

    /**
     * Array of all vector-values for shared vertex attributes that this SharedVertex holds. 
     */
    sharedVertexAttribs: number[][] = [];
    sharedEdges: Set<SharedEdge> = new Set;

    constructor(...pos: number[]) {
        this.sharedVertexAttribs[0] = pos;
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

    interpolate(sv: SharedVertex, num: number) {
        const verts: SharedVertex[] = [];
        const np1 = num + 1;
        for (let i = 1; i <= num; i++) {
            const nsv = new SharedVertex();
            nsv.sharedVertexAttribs = VecX.mixArrays(this.sharedVertexAttribs, sv.sharedVertexAttribs, i / np1);
            verts.push(nsv);
        }
        return verts;
    }
}

class Edge {
    v1;
    v2;
    isSharedOrder;

    constructor(v1: Vertex, v2: Vertex, isSharedOrder: boolean) {
        this.v1 = v1;
        this.v2 = v2;
        this.isSharedOrder = isSharedOrder;
    }

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
        sharedVertex1.sharedEdges.add(this);
        sharedVertex2.sharedEdges.add(this);
    }

    static connect(...svs: SharedVertex[]) {
        const SEs: SharedEdge[] = [];
        for (let i = 1; i < svs.length; i++)
            SEs.push(new SharedEdge(svs[i - 1], svs[i]));
        return SEs;
    }

    subdivide(cuts: number) {
        const edges = this.getEdges();

        const newSVs = this.sv1.interpolate(this.sv2, cuts);
        const newSEs = SharedEdge.connect(this.sv1, ...newSVs, this.sv2);
        for (const e of edges) {
            e.interpolateAndAssigne(newSVs);
        }

        return { newSVs, newSEs };
    }

    getEdges() {
        const edges: Edge[] = [];
        for (const v of this.sv1.children) {
            const e = v.face.findEdge(v, this.sv2);
            if (e)
                edges.push(e);
        }
        return edges;
    }

    equals(v1: SharedVertex, v2: SharedVertex) {
        return this.sv1 === v1 && this.sv2 === v2 || this.sv1 === v2 && this.sv2 === v1;
    }
}

class Face {
    vertices: Vertex[] = [];

    /**
     * Constructs a `Face` from `Vertices`
     * @param vertices should contain at least 3 elemets (we trust the user and do not check against this constraint).
     */
    constructor() {
    }

    /**
     * Findes the edge that contains v1 and a respective vertex sv. If no edge was found undefined is returned.
     * The edge is returned with vertices in order with respect to the face's winding.
     * @param v1 
     * @param sv 
     * @returns 
     */
    findEdge(v1: Vertex, sv: SharedVertex) {
        const v1i = this.vertices.indexOf(v1);
        if (v1i == -1) // FATAl: could not find v1 in this face
            return undefined;

        let other = this.vertices[(v1i + 1) % this.vertices.length]; // get the next vertex in the face
        if (sv.children.indexOf(other) != -1) // if other is in the shared vertex we found the edge
            return new Edge(v1, other, true);

        other = this.vertices[modulo(v1i - 1, this.vertices.length)]; // get the previous vertex in the face
        if (sv.children.indexOf(other) != -1) // if other is in the shared vertex we found the edge, but in 
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
    faces: Face[] = [];
    edges: SharedEdge[] = [];
    vertices: SharedVertex[] = [];

    pushSharedVertex(...pos: number[]) {
        this.vertices.push(new SharedVertex(...pos));
    }

    /**
     * Returns either the SharedEdge that matches the arguments or a new SharedEdeg constructed by the arguments and appends it to the mesh.
     * @param v1 
     * @param v2 
     * @returns either the SharedEdge that matches the arguments or a new SharedEdeg constructed by the arguments
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
        console.log(this.edges);
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
            let normal: number[] = [0, 0, 0];
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


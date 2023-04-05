
class R3Objekt {
    transformationStack;

    constructor() {
        this.transformationStack = new TransformationStack();
    }

    getWorldLocation() {
        return mat4.getTranslation(this.transformationStack.getTransformationMatrix());
    }
}

class Mesh {
    faces: Face[] = [];
    edges: SharedEdge[] = [];
    vertices: SharedVertex[] = [];

    /**
     * Returns a SharedEdge that contains the exact (===) arguments v1 and v2. Order does not matter.
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
     * Returns either the SharedEdge that matches the arguments or a new SharedEdeg constructed by the arguments and appends it to the mesh.
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

            const arr: Vertex[] = [];
            for (let i = 0; i < inArr.length; i++) {
                const sv1 = this.vertices[inArr[i]];
                const sv2 = this.vertices[inArr[(i + 1) % inArr.length]];
                const se = this.getOrCreateSharedEdge(sv1, sv2);
                arr.push(new Vertex(sv1));
            }

            this.faces.push(new Face(...arr));
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
            for (const face of faces)
                normal = vec3.add(normal, face.getNormal());
            normal = vec3.normalize(normal);
            for (const v of vert.children)
                v.vertexAttribs[1] = normal;
        }
    }

    append(mesh: Mesh) {
        this.vertices.push(...mesh.vertices);
        this.edges.push(...mesh.edges);
        this.faces.push(...mesh.faces);
    }
}

class MeshObject extends R3Objekt {

    mesh = new Mesh();
    VAO = gl.createVertexArray();
    VBOs: WebGLBuffer[] = [];

    constructor() {
        super();

        const pbo = gl.createBuffer();
        const fnbo = gl.createBuffer();
        const vnbo = gl.createBuffer();
        const guvbo = gl.createBuffer();

        if (!pbo || !fnbo || !vnbo || !guvbo)
            throw new Error("Could not create Buffer in Mesh Object");

        this.VBOs[0] = pbo;
        this.VBOs[1] = fnbo;
        this.VBOs[2] = vnbo;
        this.VBOs[3] = guvbo;

        gl.bindVertexArray(this.VAO);

        gl.bindBuffer(gl.ARRAY_BUFFER, pbo);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, fnbo);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

        gl.bindBuffer(gl.ARRAY_BUFFER, vnbo);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(2);

        gl.bindBuffer(gl.ARRAY_BUFFER, guvbo);
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(3);

        gl.bindVertexArray(null);
    }

    render() {

    }

    createAndBuildVAO(uvBuilder: () => void) {
        const pos: number[] = [];
        const vn: number[] = [];
        const fn: number[] = [];
        const guv: number[] = [];

        this.mesh.calculateFaceNormals();
        this.mesh.calculateVertexNormals();
        uvBuilder.call(this);

        for (const face of this.mesh.faces) {
            const verts = face.vertices;
            for (let i = 1; i < verts.length - 1; i++) {
                pos.push(...verts[0].sharedVertex.sharedVertexAttribs[0], ...verts[i].sharedVertex.sharedVertexAttribs[0], ...verts[i + 1].sharedVertex.sharedVertexAttribs[0]);
                fn.push(...verts[0].vertexAttribs[0], ...verts[i].vertexAttribs[0], ...verts[i + 1].vertexAttribs[0]);
                vn.push(...verts[0].vertexAttribs[1], ...verts[i].vertexAttribs[1], ...verts[i + 1].vertexAttribs[1]);
                guv.push(...verts[0].vertexAttribs[2], ...verts[i].vertexAttribs[2], ...verts[i + 1].vertexAttribs[2]);
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOs[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOs[1]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fn), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOs[2]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vn), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBOs[3]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(guv), gl.STATIC_DRAW);
    }

}

class BasicMesh {
    static appendCube(mo: MeshObject) {
        const mesh = new Mesh();
        mesh.vertices.push(
            new SharedVertex(1, 1, 1),
            new SharedVertex(-1, 1, 1),
            new SharedVertex(-1, -1, 1),
            new SharedVertex(1, -1, 1),
            new SharedVertex(1, 1, -1),
            new SharedVertex(-1, 1, -1),
            new SharedVertex(-1, -1, -1),
            new SharedVertex(1, -1, -1));
        mesh.fill(
            [0, 1, 2, 3],
            [4, 5, 1, 0],
            [7, 6, 5, 4],
            [3, 2, 6, 7],
            [4, 0, 3, 7],
            [1, 5, 6, 2]);
        function uvg(this: Mesh) {
            for (const f of this.faces) {
                for (let i = 0; i < f.vertices.length; i++)
                    f.vertices[i].vertexAttribs[2] = [Math.floor(Math.abs(i - 1.5)), Math.floor(-i / 2 + 1.75)];
            }
        };
        uvg.call(mesh);
        mo.mesh.append(mesh);

        console.log(JSON.stringify(mo.mesh));
    }
}

interface Camera {
    getProjectionMatrix(): number[];
    getViewMatrix(): number[];
    getWorldLocation(): number[];
}

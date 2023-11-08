import R3Object from "../project/R3Object";
import RenderConfig from "../project/RenderConfig";
import { gl } from "../rendering/glInit";
import Mesh from "./Mesh"

class VAO {

    VAO = gl.createVertexArray();
    pbo = gl.createBuffer();
    fnbo = gl.createBuffer();
    vnbo = gl.createBuffer();
    guvbo = gl.createBuffer();

    constructor() {
        if (!this.pbo || !this.fnbo || !this.vnbo || !this.guvbo)
            throw new Error("Could not create Buffer in Mesh Object");

        gl.bindVertexArray(this.VAO);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.pbo);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.fnbo);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vnbo);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(2);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.guvbo);
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(3);

        gl.bindVertexArray(null);
    }

}

/**
 * MeshObject wrapps CPU side data ({@link Mesh}) and GPU side binding points ({@link VAO}) together.
 */
export default class MeshObject extends R3Object {

    mesh = new Mesh();

    VAO = new VAO();
    numVertices = 0;

    constructor(index: number) {
        super(index);
    }

    static getRenderer(rc: RenderConfig): (o: MeshObject) => void {
        return (o: MeshObject) => {
            gl.bindVertexArray(o.VAO.VAO);
            gl.drawArrays(gl.TRIANGLES, 0, o.numVertices);
        }
    }

    updateGPU() {
        const pos: number[] = [];
        const vn: number[] = [];
        const fn: number[] = [];
        const guv: number[] = [];

        for (const face of this.mesh.faces) {
            const verts = face.vertices;
            for (let i = 1; i < verts.length - 1; i++) {
                pos.push(...verts[0].sharedVertex.va_position, ...verts[i].sharedVertex.va_position, ...verts[i + 1].sharedVertex.va_position);
                fn.push(...verts[0].vertexAttribs[0], ...verts[i].vertexAttribs[0], ...verts[i + 1].vertexAttribs[0]);
                vn.push(...verts[0].vertexAttribs[1], ...verts[i].vertexAttribs[1], ...verts[i + 1].vertexAttribs[1]);
                guv.push(...verts[0].vertexAttribs[2], ...verts[i].vertexAttribs[2], ...verts[i + 1].vertexAttribs[2]);
            }
        }
        this.numVertices = pos.length / 3;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VAO.pbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VAO.fnbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fn), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VAO.vnbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vn), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VAO.guvbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(guv), gl.STATIC_DRAW);
    }

}
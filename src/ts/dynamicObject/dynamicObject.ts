import vec2 from "../math/vec2";
import vec3 from "../math/vec3";
import vec4 from "../math/vec4";
import R3Object from "../project/R3Object";
import { gl } from "../rendering/glInit";
import ShaderProgram from "../shader/ShaderProgram";

export class DynamicObjectRenderer {
    render(o: DynamicObject) {
        gl.useProgram(o.shader.program);
        gl.bindVertexArray(o.vao);
        gl.drawElements(gl.TRIANGLES, o.indices.length, gl.UNSIGNED_INT, 0);
        gl.useProgram(null);
    }
}

export default class DynamicObject extends R3Object {

    shader: ShaderProgram;
    positions: vec3[] = [];
    indices: number[] = [];
    vao = gl.createVertexArray();
    pbo = gl.createBuffer();
    ibo = gl.createBuffer();
    uniformValues: { [key: string]: number | vec2 | vec3 | vec4 };

    constructor(index: number, vertexShaderCode: string, fragmentShaderCode: string, uniforms: { [key: string]: number | vec2 | vec3 | vec4 } = {}) {
        super(index);
        this.uniformValues = uniforms;

        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.pbo);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        this.shader = new ShaderProgram(vertexShaderCode, fragmentShaderCode, Object.keys(this.uniformValues));
    }

    static QuadSphere(ind: number, vertexShaderCode: string, fragmentShaderCode: string, r: number = 1, subdivision: number = 8) {
        const dynObj = new DynamicObject(ind, vertexShaderCode, fragmentShaderCode, { radius: 5 });
        const pos = dynObj.positions;
        const indices = dynObj.indices;

        let p = new vec3();

        const qsp = (p: vec3) => {
            const x2 = p.x * p.x;
            const y2 = p.y * p.y;
            const z2 = p.z * p.z;
            return new vec3(
                p.x * Math.sqrt(1 - y2 / 2 - z2 / 2 + y2 * z2 / 3) * r,
                p.y * Math.sqrt(1 - z2 / 2 - x2 / 2 + z2 * x2 / 3) * r,
                p.z * Math.sqrt(1 - x2 / 2 - y2 / 2 + x2 * y2 / 3) * r);
        }

        // +x
        p.x = 1;
        for (let y = 0; y <= subdivision; y++) {
            p.y = (y / subdivision) * -2 + 1;
            for (let z = 0; z <= subdivision; z++) {
                p.z = (z / subdivision) * 2 - 1;
                pos.push(qsp(p));
            }
        }

        // -x
        p.x = -1;
        for (let y = 0; y <= subdivision; y++) {
            p.y = (y / subdivision) * 2 - 1;
            for (let z = 0; z <= subdivision; z++) {
                p.z = (z / subdivision) * 2 - 1;
                pos.push(qsp(p));
            }
        }

        // +y
        p.y = 1;
        for (let x = 0; x <= subdivision; x++) {
            p.x = (x / subdivision) * 2 - 1;
            for (let z = 0; z <= subdivision; z++) {
                p.z = (z / subdivision) * 2 - 1;
                pos.push(qsp(p));
            }
        }

        // -y
        p.y = -1;
        for (let x = 0; x <= subdivision; x++) {
            p.x = (x / subdivision) * -2 + 1;
            for (let z = 0; z <= subdivision; z++) {
                p.z = (z / subdivision) * 2 - 1;
                pos.push(qsp(p));
            }
        }

        // +z
        p.z = 1;
        for (let y = 0; y <= subdivision; y++) {
            p.y = (y / subdivision) * 2 - 1;
            for (let x = 0; x <= subdivision; x++) {
                p.x = (x / subdivision) * 2 - 1;
                pos.push(qsp(p));
            }
        }

        // -z
        p.z = -1;
        for (let y = 0; y <= subdivision; y++) {
            p.y = (y / subdivision) * -2 + 1;
            for (let x = 0; x <= subdivision; x++) {
                p.x = (x / subdivision) * 2 - 1;
                pos.push(qsp(p));
            }
        }

        let offset = 0;
        const rowStep = subdivision + 1;
        const offsetStep = rowStep * rowStep;

        for (let i = 0; i < 6; i++) {
            for (let y = 0; y < subdivision; y++) {
                for (let x = 0; x < subdivision; x++) {
                    indices.push(
                        offset + x + (y + 1) * rowStep, offset + x + y * rowStep, offset + (x + 1) + y * rowStep,
                        offset + (x + 1) + y * rowStep, offset + (x + 1) + (y + 1) * rowStep, offset + x + (y + 1) * rowStep);
                }
            }
            offset += offsetStep;
        }

        dynObj.updateGPU();
        return dynObj;
    }

    updateGPU(): void {
        const pos = new Float32Array(this.positions.length * 3);
        let i = 0;
        for (const v of this.positions) {
            v.pushInFloat32Array(pos, i)
            i += 3;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.pbo);
        gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array(this.indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

}
import vec4 from "../math/vec4";
import { getGLViewport, gl } from "../rendering/glInit";
import { ViewportPane } from "../ui/ViewportPane";
import { Shader3D } from "./Shader3D"

export default class ShaderProgram {

    program: WebGLProgram;
    uniformLocations: WebGLUniformLocation[] = [];


    static modelTransformationUB = gl.createBuffer();
    static viewUB = gl.createBuffer();
    static gridDataBuffer = gl.createBuffer();

    static {
        gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, ShaderProgram.viewUB);
        gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(2 * 16 + 12), gl.DYNAMIC_DRAW);

        gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, ShaderProgram.modelTransformationUB);
        gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(Shader3D.maxModelMats * 16), gl.DYNAMIC_DRAW);

        gl.bindBufferBase(gl.UNIFORM_BUFFER, 2, ShaderProgram.gridDataBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(2 * 2 * 64 * 16), gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    }

    constructor(vs: string, fs: string, uniforms?: string[], transformFeedbackVarings?: string[], bufferMode?: number) {
        this.program = ShaderProgram.createProgram(
            ShaderProgram.createShader(gl.VERTEX_SHADER, vs),
            ShaderProgram.createShader(gl.FRAGMENT_SHADER, fs), transformFeedbackVarings, bufferMode);

        let ub;
        if ((ub = gl.getUniformBlockIndex(this.program, "view")) < 128)
            gl.uniformBlockBinding(this.program, ub, 0);
        if ((ub = gl.getUniformBlockIndex(this.program, "model")) < 128)
            gl.uniformBlockBinding(this.program, ub, 1);
        if ((ub = gl.getUniformBlockIndex(this.program, "grid")) < 128)
            gl.uniformBlockBinding(this.program, ub, 2);


        if (uniforms !== undefined) {
            for (let i = 0; i < uniforms.length; i++) {
                this.uniformLocations.push(gl.getUniformLocation(this.program, uniforms[i]) as WebGLUniformLocation);
            }
        }
    }

    static loadProjectionMatrix(mat: number[]) {
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array(mat));
    }

    static updateView(view: ViewportPane, frame: number) {
        gl.bindBuffer(gl.UNIFORM_BUFFER, ShaderProgram.viewUB);
        const fl = new Float32Array(2 * 16 + 4);
        const cam = view.camera;
        cam.getProjectionMatrix().pushInFloat32ArrayColumnMajor(fl, 0);
        cam.getViewMatrix().pushInFloat32ArrayColumnMajor(fl, 16)
        new vec4(...cam.getWorldLocation(), 0).pushInFloat32Array(fl, 32);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, fl);
        gl.bufferSubData(gl.UNIFORM_BUFFER, fl.byteLength, new Int32Array(getGLViewport(view)));
        gl.bufferSubData(gl.UNIFORM_BUFFER, fl.byteLength + 4 * 4, new Int32Array([frame, 0, 0, 0]));
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.viewport(0, 0, cam.width, cam.height);
    }

    static loadViewMatrix(mat: number[]) {
        gl.bufferSubData(gl.UNIFORM_BUFFER, 64, new Float32Array(mat));
    }

    static loadCameraPosition(pos: number[]) {
        gl.bufferSubData(gl.UNIFORM_BUFFER, 128, new Float32Array(pos));
    }

    static loadModelMatrix(i: number, mat: number[]) {
        gl.bufferSubData(gl.UNIFORM_BUFFER, i * 64, new Float32Array(mat));
    }

    loadf(loc: number, f: number) {
        gl.uniform1f(this.uniformLocations[loc], f);
    }

    loadVec2(loc: number, x: number, y: number) {
        gl.uniform2f(this.uniformLocations[loc], x, y);
    }

    loadVec3(loc: number, x: number, y: number, z: number) {
        gl.uniform3f(this.uniformLocations[loc], x, y, z);
    }

    loadui(loc: number, i: number) {
        gl.uniform1ui(this.uniformLocations[loc], i);
    }

    loadMat4(loc: number, mat4: number[]) {
        gl.uniformMatrix4fv(this.uniformLocations[loc], false, new Float32Array(mat4));
    }

    private static createShader(type: number, source: string) {
        let shader = gl.createShader(type) as WebGLShader;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            return shader;

        console.error("Could not compile " + source);
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw undefined;
    }

    private static createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader, transformFeedbackVarings?: string[], bufferMode?: number) {
        let program = gl.createProgram() as WebGLProgram;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        if (transformFeedbackVarings !== undefined && bufferMode !== undefined)
            gl.transformFeedbackVaryings(program, transformFeedbackVarings, bufferMode);

        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS))
            return program;

        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw undefined;
    }
}
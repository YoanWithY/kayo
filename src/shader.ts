"use strict"
let projection = mat4.perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 1000);
const ubView = `layout(std140) uniform view {
    mat4 projectionMat;
    mat4 viewMat;
    vec4 cameraPosition;
    ivec4 viewport;
};`
const maxModelMats = 1024;
const ubTransform = `layout(std140) uniform model{
    mat4 modelMat[${maxModelMats}];
  };
`
class Shader {
    program: WebGLProgram;
    uniformLocations: WebGLUniformLocation[] = [];
    static defaultVertexShaderCode = `#version 300 es

    layout(location = 0) in vec3 inPos;
    layout(location = 1) in vec3 inFaceNor;
    layout(location = 2) in vec3 inVertNor;
    layout(location = 3) in vec2 inTc;   
    
    out vec3 localspace_face_normal;
    out vec3 worldspace_face_normal;
    out vec3 cameraspace_face_normal;

    out vec3 localspace_vertex_normal;
    out vec3 worldspace_vertex_normal;
    out vec3 cameraspace_vertex_normal;

    out vec3 localspace_position;
    out vec3 worldspace_position;
    out vec3 cameraspace_position;

    out vec2 TC;
    out vec3 barycentric;
    
    ${ubView}
    ${ubTransform}

    uniform uint index;

    const vec3 barycentrics[3] = vec3[](vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));
    
    void main(){
        mat4 mMat = modelMat[index]; 

        localspace_position = inPos;
        worldspace_position = (mMat * vec4(localspace_position, 1)).xyz;
        cameraspace_position = (viewMat * vec4(worldspace_position, 1)).xyz;
        gl_Position = projectionMat * vec4(cameraspace_position, 1);
        
        mat3 nmMat = mat3(transpose(inverse(mMat))); 
        mat3 nvMat = mat3(transpose(inverse(viewMat * mMat)));

        localspace_face_normal = inFaceNor;
        worldspace_face_normal = normalize(nmMat * localspace_face_normal);
        cameraspace_face_normal = normalize(nvMat * inFaceNor);

        localspace_vertex_normal = inVertNor;
        worldspace_vertex_normal = normalize(nmMat * localspace_vertex_normal);
        cameraspace_vertex_normal = normalize(nvMat * inVertNor);

        TC = inTc;
        barycentric = barycentrics[gl_VertexID % 3];
        
    }`;

    static defaultFragmentShaderCode = `#version 300 es

    precision highp float;
    precision highp int;
    
    uniform uint index;
    uniform sampler2D albedo;

    in vec3 localspace_face_normal;
    in vec3 worldspace_face_normal;
    in vec3 cameraspace_face_normal;
    
    in vec3 localspace_vertex_normal;
    in vec3 worldspace_vertex_normal;
    in vec3 cameraspace_vertex_normal;

    in vec3 localspace_position;
    in vec3 worldspace_position;
    in vec3 cameraspace_position;

    in vec2 TC;
    in vec3 barycentric;

    layout(location = 0) out vec4 outColor;
    layout(location = 1) out uint objectIndex;
    vec3 ls_v_N, ws_v_N, cs_v_N, ls_f_N, ws_f_N, cs_f_N;
    
    void main(){
        ls_f_N = normalize(localspace_face_normal);
        ws_f_N = normalize(worldspace_face_normal);
        cs_f_N = normalize(cameraspace_face_normal);

        ls_v_N = normalize(localspace_vertex_normal);
        ws_v_N = normalize(worldspace_vertex_normal);
        cs_v_N = normalize(cameraspace_vertex_normal);

        outColor = vec4(texture(albedo, TC).rgb, 1);
        outColor = vec4(ws_v_N, 1);
        objectIndex = index; 
    }`

    static geometryOnlyVertexShaderCode = `#version 300 es

    in vec3 inPos;
    
    ${ubView}
    ${ubTransform}

    uniform uint index;
    
    void main(){
        gl_Position = projectionMat * viewMat * modelMat[index] * vec4(inPos, 1);
    }`;

    static indexOutputFragmentShaderCode = `#version 300 es

    precision highp float;
    precision highp int;
    
    uniform uint index;

    layout(location = 0) out uint outIndex;
    
    void main(){
        outIndex = index; 
    }
    `

    static modelTransformationUB = gl.createBuffer();
    static viewUB = gl.createBuffer();
    static gridDataBuffer = gl.createBuffer();

    static {
        gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, Shader.viewUB);
        gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(2 * 16 + 8), gl.DYNAMIC_DRAW);

        gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, Shader.modelTransformationUB);
        gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(maxModelMats * 16), gl.DYNAMIC_DRAW);

        gl.bindBufferBase(gl.UNIFORM_BUFFER, 2, Shader.gridDataBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(2 * 2 * 64 * 16), gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    }

    static emptyFragmentShader = `#version 300 es
    precision highp float;
    void main(){
    }`

    constructor(vs: string, fs: string, uniforms?: string[], transformFeedbackVarings?: string[], bufferMode?: number) {
        this.program = Shader.createProgram(
            Shader.createShader(gl.VERTEX_SHADER, vs),
            Shader.createShader(gl.FRAGMENT_SHADER, fs), transformFeedbackVarings, bufferMode);

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

    static updateView(view: ViewPortPane) {
        gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.viewUB);
        const fl = new Float32Array([...view.getProjectionMatrix(), ...view.getViewMatrix(), ...view.getWorldLocation(), 0]);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, fl);
        gl.bufferSubData(gl.UNIFORM_BUFFER, fl.byteLength, new Int32Array(view.getGLViewport()));
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.viewport(0, 0, view.framebuffer.width, view.framebuffer.height);
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

function setupCanvas() {
    // Get the device pixel ratio, falling back to 1.
    let dpr = window.devicePixelRatio || 1;

    let width = glCanvas.clientWidth;
    let height = glCanvas.clientHeight;
    if (glCanvas.width != width || glCanvas.height != height) {
        glCanvas.width = width * dpr;
        glCanvas.height = height * dpr;
    }
}

window.addEventListener('resize', setupCanvas);

const noTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, noTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
gl.bindTexture(gl.TEXTURE_2D, null);

class material {
    static global_textures = new Map();
    textures = [noTexture];

    bindTextures() {
        for (let i = 0; i < this.textures.length; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i])
        }
    }

    setTexture(index: number, url: string) {

        if (material.global_textures.has(url)) {
            this.textures[index] = material.global_textures.get(url);
            return;
        }

        const image = new Image();
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
        gl.bindTexture(gl.TEXTURE_2D, null);

        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameterf(gl.TEXTURE_2D, extTFA.TEXTURE_MAX_ANISOTROPY_EXT, gl.getParameter(extTFA.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
            this.textures[index] = texture;
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        image.crossOrigin = "anonymous";
        image.src = url;
    }
}
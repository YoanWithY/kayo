"use strict";
let projection = mat4.perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 1000);
const ubView = `layout(std140) uniform view {
    mat4 projectionMat;
    mat4 viewMat;
    vec4 cameraPosition;
};`;
class Shader {
    constructor(vs, fs, uniforms, transformFeedbackVarings, bufferMode) {
        this.uniformLocations = [];
        this.program = Shader.createProgram(Shader.createShader(gl.VERTEX_SHADER, vs), Shader.createShader(gl.FRAGMENT_SHADER, fs), transformFeedbackVarings, bufferMode);
        let ub;
        if ((ub = gl.getUniformBlockIndex(this.program, "view")) < 128)
            gl.uniformBlockBinding(this.program, ub, 0);
        if ((ub = gl.getUniformBlockIndex(this.program, "model")) < 128)
            gl.uniformBlockBinding(this.program, ub, 1);
        if ((ub = gl.getUniformBlockIndex(this.program, "grid")) < 128)
            gl.uniformBlockBinding(this.program, ub, 2);
        if (uniforms !== undefined) {
            for (let i = 0; i < uniforms.length; i++) {
                this.uniformLocations.push(gl.getUniformLocation(this.program, uniforms[i]));
            }
        }
    }
    static loadProjectionMatrix(mat) {
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array(mat));
    }
    static updateView(view) {
        gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.viewUB);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array(view.getProjectionMatrix().concat(view.getViewMatrix()).concat(view.getWorldLocation())));
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.viewport(0, 0, view.framebuffer.width, view.framebuffer.height);
    }
    static loadViewMatrix(mat) {
        gl.bufferSubData(gl.UNIFORM_BUFFER, 64, new Float32Array(mat));
    }
    static loadCameraPosition(pos) {
        gl.bufferSubData(gl.UNIFORM_BUFFER, 128, new Float32Array(pos));
    }
    static loadModelMatrix(i, mat) {
        gl.bufferSubData(gl.UNIFORM_BUFFER, i * 64, new Float32Array(mat));
    }
    loadf(loc, f) {
        gl.uniform1f(this.uniformLocations[loc], f);
    }
    loadVec2(loc, x, y) {
        gl.uniform2f(this.uniformLocations[loc], x, y);
    }
    loadVec3(loc, x, y, z) {
        gl.uniform3f(this.uniformLocations[loc], x, y, z);
    }
    loadui(loc, i) {
        gl.uniform1ui(this.uniformLocations[loc], i);
    }
    loadMat4(loc, mat4) {
        gl.uniformMatrix4fv(this.uniformLocations[loc], false, new Float32Array(mat4));
    }
    static createShader(type, source) {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            return shader;
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw undefined;
    }
    static createProgram(vertexShader, fragmentShader, transformFeedbackVarings, bufferMode) {
        let program = gl.createProgram();
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
Shader.numModelMats = 1024;
Shader.defaultVertexShaderCode = `#version 300 es

    in vec3 inPos;
    in vec3 inNor;
    in vec2 inTc;   
    
    out vec3 localspace_vertex_normal;
    out vec3 worldspace_vertex_normal;
    out vec3 cameraspace_vertex_normal;
    out vec3 localspace_position;
    out vec3 worldspace_position;
    out vec3 cameraspace_position;
    out vec2 TC;
    out vec3 barycentric;
    
   ${ubView}

    layout(std140) uniform model{
      mat4 modelMat[${Shader.numModelMats}];
    };

    uniform uint index;

    const vec3 barycentrics[3] = vec3[](vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));
    
    void main(){
        localspace_position = inPos;
        worldspace_position = (modelMat[index] * vec4(localspace_position, 1)).xyz;
        cameraspace_position = (viewMat * vec4(worldspace_position, 1)).xyz;
        gl_Position = projectionMat * vec4(cameraspace_position, 1);
        
        localspace_vertex_normal = inNor;
        mat3 nmMat = mat3(transpose(inverse(modelMat[index])));
        worldspace_vertex_normal = normalize(nmMat * localspace_vertex_normal);
        mat3 nvMat = mat3(transpose(inverse(viewMat * modelMat[index])));
        cameraspace_vertex_normal = normalize(nvMat * inNor);

        TC = inTc;
        barycentric = barycentrics[gl_VertexID % 3];
        
    }`;
Shader.defaultFragmentShaderCode = `#version 300 es

    precision highp float;
    precision highp int;
    
    uniform uint index;
    uniform sampler2D albedo;
    
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
    vec3 ls_v_N, ws_v_N, cs_v_N;
    
    void main(){
        ls_v_N = normalize(localspace_vertex_normal);
        ws_v_N = normalize(worldspace_vertex_normal);
        cs_v_N = normalize(cameraspace_vertex_normal);

        outColor = vec4(texture(albedo, TC).rgb, 1);
        objectIndex = index; 
    }`;
Shader.modelTransformationUB = gl.createBuffer();
Shader.viewUB = gl.createBuffer();
Shader.gridDataBuffer = gl.createBuffer();
(() => {
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, Shader.viewUB);
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(2 * 16 + 4), gl.DYNAMIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, Shader.modelTransformationUB);
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(Shader.numModelMats * 16), gl.DYNAMIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 2, Shader.gridDataBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(2 * 2 * 64 * 16), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
})();
Shader.emptyFragmentShader = `#version 300 es
    precision highp float;
    void main(){
    }`;
function setupCanvas() {
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
    constructor() {
        this.textures = [noTexture];
    }
    bindTextures() {
        for (let i = 0; i < this.textures.length; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
        }
    }
    setTexture(index, url) {
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
        };
        image.crossOrigin = "anonymous";
        image.src = url;
    }
}
material.global_textures = new Map();

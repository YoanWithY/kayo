"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _Shader_createShader, _Shader_createProgram;
let projection = mat4.perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 1000);
class Shader {
    constructor(vs, fs, ...args) {
        this.uniformLocations = [];
        this.program = __classPrivateFieldGet(Shader, _a, "m", _Shader_createProgram).call(Shader, __classPrivateFieldGet(Shader, _a, "m", _Shader_createShader).call(Shader, gl.VERTEX_SHADER, vs), __classPrivateFieldGet(Shader, _a, "m", _Shader_createShader).call(Shader, gl.FRAGMENT_SHADER, fs));
        gl.uniformBlockBinding(this.program, gl.getUniformBlockIndex(this.program, "view"), 0);
        gl.uniformBlockBinding(this.program, gl.getUniformBlockIndex(this.program, "model"), 1);
        for (let i = 0; i < args.length; i++) {
            this.uniformLocations.push(gl.getUniformLocation(this.program, args[i]));
        }
    }
    static loadProjectionMatrix(mat) {
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array(mat));
    }
    static loadViewMatrix(mat) {
        gl.bufferSubData(gl.UNIFORM_BUFFER, 64, new Float32Array(mat));
    }
    static loadModelMatrix(i, mat) {
        gl.bufferSubData(gl.UNIFORM_BUFFER, i * 64, new Float32Array(mat));
    }
    loadf(loc, f) {
        gl.uniform1f(this.uniformLocations[loc], f);
    }
    loadui(loc, i) {
        gl.uniform1ui(this.uniformLocations[loc], i);
    }
    loadMat4(loc, mat4) {
        gl.uniformMatrix4fv(this.uniformLocations[loc], false, new Float32Array(mat4));
    }
}
_a = Shader, _Shader_createShader = function _Shader_createShader(type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        return shader;
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw undefined;
}, _Shader_createProgram = function _Shader_createProgram(vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS))
        return program;
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw undefined;
};
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
    
    layout(std140) uniform view {
        mat4 projectionMat;
        mat4 viewMat;
    };

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
    
    uniform sampler2D albedo;
    
    in vec3 localspace_vertex_normal;
    in vec3 worldspace_vertex_normal;
    in vec3 cameraspace_vertex_normal;
    in vec3 localspace_position;
    in vec3 worldspace_position;
    in vec3 cameraspace_position;
    in vec2 TC;
    in vec3 barycentric;

    out vec4 outColor;
    vec3 ls_v_N, ws_v_N, cs_v_N;
    
    void main(){
        ls_v_N = normalize(localspace_vertex_normal);
        ws_v_N = normalize(worldspace_vertex_normal);
        cs_v_N = normalize(cameraspace_vertex_normal);

        outColor = vec4(texture(albedo, TC).rgb, 1);
        
    }`;
Shader.modelTransformationUB = gl.createBuffer();
Shader.viewUB = gl.createBuffer();
(() => {
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, Shader.viewUB);
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(2 * 16), gl.DYNAMIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, Shader.modelTransformationUB);
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(Shader.numModelMats * 16), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
})();
Shader.defaultLineVertexShaderCode = `#version 300 es

    in vec3 inPos;
    in vec2 inOff;
    in vec4 inColor;
    in float inWeight;
    
    layout(std140) uniform view {
        mat4 projectionMat;
        mat4 viewMat;
    };

    out vec4 color;
    out float weight;
    out vec3 cPos;
    out float z;
    
    void main(){
        cPos = (viewMat * vec4(inPos, 1)).xyz;
        gl_Position = projectionMat * vec4(cPos, 1);
        gl_Position += vec4(inOff * 2.0 * gl_Position.w, 0,0);
        color = inColor;
        weight = inWeight / sqrt(2.0) * gl_Position.w;   
        z = gl_Position.w;   
    }`;
Shader.defaultLineFragmentShaderCode = `#version 300 es

    precision highp float;
    
    uniform sampler2D albedo;
    
    in vec4 color;
    in float weight;
    in vec3 cPos;
    in float z;

    out vec4 outColor;
    
    void main(){
        float wp = weight / z;
        outColor = color;
        outColor.a *= min(wp, 1.0) * smoothstep(30.0, 15.0, length(cPos));
    }`;
function setupCanvas() {
    let dpr = window.devicePixelRatio || 1;
    let width = glCanvas.clientWidth;
    let height = glCanvas.clientHeight;
    if (glCanvas.width != width || glCanvas.height != height) {
        glCanvas.width = width * dpr;
        glCanvas.height = height * dpr;
        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.viewUB);
        Shader.loadProjectionMatrix(mat4.perspective(60, width / height, 0.1, 1000));
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
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

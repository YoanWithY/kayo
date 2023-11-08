import mat4 from "../math/mat4";
import { gl } from "../rendering/glInit";
import gf from '../../glsl/generalFunctions.glsl';

export namespace Shader3D {

    export const unit_cube_vao = gl.createVertexArray()
    export const unit_cube_index_count = 6 * 2 * 3;
    gl.bindVertexArray(unit_cube_vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
        [
            1, 1, 1,
            -1, 1, 1,
            -1, -1, 1,
            1, -1, 1,
            1, 1, -1,
            -1, 1, -1,
            -1, -1, -1,
            1, -1, -1
        ]), gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(
        [
            4, 5, 6,
            4, 6, 7,
            5, 1, 2,
            5, 2, 6,
            1, 0, 3,
            1, 3, 2,
            0, 4, 7,
            0, 7, 3,
            0, 1, 5,
            0, 5, 4,
            7, 6, 2,
            7, 2, 3

        ]), gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    export let projection = mat4.perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 1000);
    export const ubView = /*glsl*/`
layout(std140) uniform view {
    mat4 projectionMat;
    mat4 viewMat;
    vec4 cameraPosition;
    ivec4 viewport;
    ivec4 frame;
};
    `;
    export const maxModelMats = 1024;
    export const ubTransform = /*glsl*/`layout(std140) uniform model{
        mat4 modelMat[${maxModelMats}];
    };
    `

    export const v300_es__highp_decl = /*glsl*/ `#version 300 es
    precision highp float;
    precision highp int;`

    export const generalFunctions = gf;

    export const emptyFragmentShader = /*glsl*/`#version 300 es
    precision highp float;
    void main(){};
    `;

    export const defaultVertexShaderCode = /*glsl*/`#version 300 es

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
        
    }
    `;

    export const defaultFragmentShaderCode = /*glsl*/`#version 300 es

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
        if(gl_FrontFacing){
            ls_f_N = normalize(localspace_face_normal);
            ws_f_N = normalize(worldspace_face_normal);
            cs_f_N = normalize(cameraspace_face_normal);
    
            ls_v_N = normalize(localspace_vertex_normal);
            ws_v_N = normalize(worldspace_vertex_normal);
            cs_v_N = normalize(cameraspace_vertex_normal);
        } else {
            ls_f_N = normalize(-localspace_face_normal);
            ws_f_N = normalize(-worldspace_face_normal);
            cs_f_N = normalize(-cameraspace_face_normal);
    
            ls_v_N = normalize(-localspace_vertex_normal);
            ws_v_N = normalize(-worldspace_vertex_normal);
            cs_v_N = normalize(-cameraspace_vertex_normal);
        }
       

        outColor = vec4(texture(albedo, TC).rgb, 1);
        float x = max(dot(ws_v_N, normalize(vec3(1,1,1))),0.0);
        outColor = vec4(x, x, x, 1);
        objectIndex = index; 
    }
    `;

    export const geometryOnlyVertexShaderCode = /*glsl*/ `#version 300 es

    in vec3 inPos;
    
    ${ubView}
    ${ubTransform}

    uniform uint index;
    
    void main(){
        gl_Position = projectionMat * viewMat * modelMat[index] * vec4(inPos, 1);
    }`;

    export const indexOutputFragmentShaderCode = /*glsl*/ `#version 300 es

    precision highp float;
    precision highp int;
    
    uniform uint index;

    layout(location = 0) out uint outIndex;
    
    void main(){
        outIndex = index; 
    }
    `;
}
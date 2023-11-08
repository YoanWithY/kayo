import Camera from "../Viewport/Camera";
import { worldShaderCode } from "../project/World";
import { gl } from "../rendering/glInit";
import { Shader3D } from "../shader/Shader3D";
import ShaderProgram from "../shader/ShaderProgram";
import raymarch from "./raymarch.glsl";

const shader = new ShaderProgram(
    `#version 300 es
    layout(location = 0) in vec3 iPos;
    ${Shader3D.ubView}
    out vec3 position;

    void main() {
        position = iPos;
        gl_Position = projectionMat * vec4(mat3(viewMat) * iPos, 1);
    }
    `,
    /*glsl*/`${Shader3D.v300_es__highp_decl}
    layout(location = 0) out vec4 outColor;
    layout(location = 1) out uint objectIndex;
    ${Shader3D.ubView}
    in vec3 position;
    ${worldShaderCode}
    ${raymarch}

    vec3 translateTo(vec3 pos, vec3 p) {
        return p - pos;
    }

    mat4 affineTransformTo(vec3 pos, vec3 rotate) {
        vec3 cosR = cos(rotate);
        vec3 sinR = sin(rotate);
        return inverse(mat4(
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            pos,1
        ) * mat4(
            1,0,0,0,
            0,cosR.x, sinR.x, 0,
            0,-sinR.x, cosR.x, 0,
            0,0,0,1
        ) * mat4(
            cosR.y, 0, -sinR.y, 0,
            0, 1, 0, 0,
            sinR.y, 0, cosR.y, 0,
            0,0,0,1
        ) * mat4(
            cosR.z, sinR.z, 0, 0,
            -sinR.z, cosR.z, 0,0,
            0,0,1,0,
            0,0,0,1
        ));
    }

    vec3 repeat(vec3 s, vec3 p){
        return p - s * round(p / s);
    }

    float SDF(vec3 pos) {
        float cube = roundBoxSDF(vec3(1.0), 0.1, pos);
        vec3 p = (affineTransformTo(vec3(1.1,0,0), vec3(0,radians(90.0), radians(45.0))) * vec4(pos, 1)).xyz;

        float cross = opExtrusion(roundedCrossSDF2D(0.8, 0.05, p.xy), 0.2, p) - 0.05;
        return smooth_polynomial_3_subtraction(cube, cross, 0.1);
    }

    vec3 materialSDF(vec3 pos) {
        return vec3(1);
    }


    vec3 visualizeSDF(float sdf) {
        vec3 c = sign(sdf) >= 0.0 ? vec3(0,1,0) : vec3(1,0,1);
        float f = sqrt(abs(sdf / 4.0));
        float z = exp(-sdf * sdf * 1024.0);
        float r = sin(sdf * 128.0) * 0.2 + 0.8;
    
        return c * f * r + vec3(z);
    }

    // #define VISUALIZE 8.0
    void main() {
        objectIndex = 0u;
        #ifndef VISUALIZE
        vec3 p = normalize(position);
        RaymarchResult R = raymarch(cameraPosition.xyz, p);
        outColor = vec4(R.color, 1.0);
        #else
        vec3 p = normalize(position);
        outColor = vec4(visualizeSDF(SDF(cameraPosition.xyz + p * VISUALIZE)), 1.0);
        #endif
        // outColor = vec4(vec3(fersnel), 1.0);
    }
`
)

export default class RaymarchingScene {

    public render(cam: Camera) {
        gl.useProgram(shader.program);
        gl.disable(gl.DEPTH_TEST);
        gl.depthMask(false);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        gl.bindVertexArray(Shader3D.unit_cube_vao);
        gl.drawElements(gl.TRIANGLES, Shader3D.unit_cube_index_count, gl.UNSIGNED_BYTE, 0);
        gl.useProgram(null);
    }
}
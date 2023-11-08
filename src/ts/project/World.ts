import Camera from "../Viewport/Camera";
import { gl } from "../rendering/glInit";
import { Shader3D } from "../shader/Shader3D";
import ShaderProgram from "../shader/ShaderProgram";

export const worldShaderCode = /*glsl*/ `
${Shader3D.generalFunctions}
vec3 world(vec3 dir) {
    dir = normalize(dir);
    Voronoi3D v = getVoronoi(
        dir + vec3(frame.x) / 500.0,
        8.5,
        vec3(dir.x * dir.x));
    return vec3(v.color * v.distance);
}
`

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
    ${worldShaderCode}

    in vec3 position;
    
    void main() {
        objectIndex = 0u;  
        outColor = vec4(world(position), 1);
    }
`
)

/**
 * The World represent the Background of the scene at inifinite distance.
 */
export default class World {

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
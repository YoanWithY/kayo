import DynamicObject from "../dynamicObject/dynamicObject";
import Scene from "../project/Scene";
import { Shader3D } from "../shader/Shader3D";
import ShaderProgram from "../shader/ShaderProgram";
import { ViewportPane } from "../ui/ViewportPane";
import { getGLViewport, gl } from "./glInit";

let frameCounter = 0;
let prevTime = 0;
let prevFPS: number[] = [];
const fpsElem = document.querySelector("#fps") as HTMLSpanElement;

function avg(arr: number[]) {
    let sum = 0;
    arr.forEach(v => sum += v);
    return sum / arr.length;
}

const vertexShaderCode = /*glsl*/`#version 300 es

${Shader3D.ubView}
const vec3 barycentrics[3] = vec3[](vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));

out vec3 localspace_position;
out vec3 worldspace_position;
out vec3 cameraspace_position;
out vec3 localspace_vertex_normal;
out vec3 worldspace_vertex_normal;
out vec3 cameraspace_vertex_normal;
flat out vec3 barycentric;

in vec3 inPos;
// the radius of the planet
uniform float radius;

float heightOffset(vec3 p){
    float f = float(frame.x);
    return 0.05 * sin(p.x * 10.0) * sin(p.y * 10.0 + f / 10.0) * sin(p.z * 20.0) + 0.3 * sin(p.x + f / 50.0);
}

void main() {
    float height = heightOffset(inPos);
    vec3 iPosN = normalize(inPos);
    localspace_position = iPosN * (radius + height);

    vec3 T = cross(iPosN, vec3(0,0,1));
    vec3 B = cross(iPosN, T);

    vec3 p1N = normalize(iPosN + 0.0001 * radius * T);
    vec3 p1 = p1N * (radius + heightOffset(p1N * radius));

    vec3 p2N = normalize(iPosN + 0.0001 * radius * B);
    vec3 p2 = p2N * (radius + heightOffset(p2N * radius));

    mat3 nvMat = mat3(transpose(inverse(viewMat)));

    localspace_vertex_normal = normalize(cross(p1 - localspace_position, p2 - localspace_position));;
    worldspace_vertex_normal = localspace_vertex_normal;
    cameraspace_vertex_normal = normalize(nvMat * localspace_vertex_normal);

    worldspace_position = localspace_position.xyz;
    cameraspace_position = (viewMat * vec4(worldspace_position, 1)).xyz;
    gl_Position = projectionMat * vec4(cameraspace_position, 1);
    barycentric = barycentrics[gl_VertexID % 3];
}`;

const fragmentShaderCode = /*glsl*/`${Shader3D.v300_es__highp_decl}
layout(location = 0) out vec4 outColor;
layout(location = 1) out uint objectIndex;
${Shader3D.ubView}
in vec3 localspace_position;
in vec3 worldspace_position;
in vec3 cameraspace_position;
in vec3 localspace_vertex_normal;
in vec3 worldspace_vertex_normal;
in vec3 cameraspace_vertex_normal;
flat in vec3 barycentric;
void main() {
    objectIndex = 1u;
    vec3 N  = normalize(worldspace_vertex_normal);
    vec3 V = normalize(cameraPosition.xyz - worldspace_position);
    vec3 L = normalize(vec3(1,1,1));
    vec3 H = normalize(V + L);
    vec3 lightColor = vec3(1) * 1.0;
    vec3 diffuse = lightColor * clamp(dot(N, L), 0.0, 1.0);
    vec3 specular = lightColor * pow(clamp(dot(N, H), 0.0, 1.0), 30.0);
    vec3 ambient = vec3(0.1);

    vec3 albedo = vec3(1);
    outColor = vec4(mix((diffuse + ambient) * albedo, specular, 0.25), 1);
}
`;

const scene = new Scene();
const radius = 10;
const dynmaicObject = DynamicObject.QuadSphere(1, vertexShaderCode, fragmentShaderCode, radius, 356);
gl.useProgram(dynmaicObject.shader.program);
dynmaicObject.shader.loadf("radius", radius);
gl.useProgram(null);
scene.dynamicObjects.add(dynmaicObject);

export default function renderloop(timestamp: number) {
    let val = timestamp / 5000;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(val % 1, 1, 1, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let viewport of ViewportPane.viewports) {
        ShaderProgram.updateView(viewport, frameCounter);
        const cam = viewport.camera;
        const fb = cam.framebuffer;

        fb.reset();
        fb.bindRenderFBO();

        scene.render(cam);

        const bb = getGLViewport(viewport);
        gl.viewport(...bb);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        fb.blitToActiveFramebuffer();
    }

    prevFPS[frameCounter % 16] = Math.round(1000 / (timestamp - prevTime));
    fpsElem.textContent = (avg(prevFPS)).toFixed(0);
    prevTime = timestamp;
    frameCounter++;
    window.requestAnimationFrame(renderloop);
}
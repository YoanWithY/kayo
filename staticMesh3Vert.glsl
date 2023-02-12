#version 300 es

in vec3 inPos;
in vec3 inNor;
in vec2 inTc;

out vec3 N;
out vec2 TC;

uniform mat4 TMat;

void main(){
    N = inNor;
    TC = inTc;
    gl_Position = TMat * vec4(inPos, 1);
}
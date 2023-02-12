#version 300 es

precision highp float;

uniform sampler2D albedo;

in vec3 N;
in vec2 TC;
out vec4 outColor;

void main(){
    outColor = texture(albedo, TC);
}
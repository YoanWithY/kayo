"use strict";
var _a;
const lineSegmentGeometryGenerationVertexShader = `#version 300 es
in vec3 p0;
in vec3 p1;

${ubView}

uniform vec3 posOff;
uniform vec2 fac;

out vec2 p0OL, p0OM, p0OR, p1OL, p1OM, p1OR;

void main(){
    vec3 camPosOff = vec3(floor(cameraPosition.xy), 0);
    mat4 tMat = projectionMat * viewMat;
    vec4 p0p = (tMat * vec4(p0 + camPosOff, 1));
    vec4 p1p = (tMat * vec4(p1 + camPosOff, 1));
    p0p /= p0p.w;
    p1p /= p1p.w;
    vec2 t = normalize(p1p.xy - p0p.xy);
    p0OL = p1OL = vec2(-t.y, t.x) * fac;
    p0OM = p1OM = vec2(0.0);
    p0OR = p1OR = -p0OL;
}
`;
const debudHint = "DEBUGn";
class Grid3D {
    static subdivisons(d) {
        return Math.max(Math.floor((128 - Math.sqrt(64 * (d - 1))) / 8), 2);
    }
    static appendD(pos, weight, d, spacing) {
        const subs = this.subdivisons(d);
        const dists = [];
        for (let x = 0; x <= subs; x++) {
            const dn = x / subs;
            dists[x] = this.minorRange * dn * dn;
        }
        const max = dists.length - 1;
        for (let i = 0; i < max; i++) {
            pos.push(dists[i], d, 0, dists[i], d, 0, dists[i], d, 0, dists[i + 1], d, 0, dists[i + 1], d, 0, dists[i + 1], d, 0);
            weight.push(0, 0, 255, 0, 0, 0, 0, 0, 255, 0, 0, 0);
        }
        for (let i = 0; i < max; i++) {
            pos.push(-dists[i], d, 0, -dists[i], d, 0, -dists[i], d, 0, -dists[i + 1], d, 0, -dists[i + 1], d, 0, -dists[i + 1], d, 0);
            weight.push(0, 0, 255, 0, 0, 0, 0, 0, 255, 0, 0, 0);
        }
        for (let i = 0; i < max; i++) {
            pos.push(d, dists[i], 0, d, dists[i], 0, d, dists[i], 0, d, dists[i + 1], 0, d, dists[i + 1], 0, d, dists[i + 1], 0);
            weight.push(0, 1, 255, 1, 0, 1, 0, 1, 255, 1, 0, 1);
        }
        for (let i = 0; i < max; i++) {
            pos.push(d, -dists[i], 0, d, -dists[i], 0, d, -dists[i], 0, d, -dists[i + 1], 0, d, -dists[i + 1], 0, d, -dists[i + 1], 0);
            weight.push(0, 1, 255, 1, 0, 1, 0, 1, 255, 1, 0, 1);
        }
        const nd = spacing - d;
        for (let i = 0; i < max; i++) {
            pos.push(dists[i], nd, 0, dists[i], nd, 0, dists[i], nd, 0, dists[i + 1], nd, 0, dists[i + 1], nd, 0, dists[i + 1], nd, 0);
            weight.push(0, 0, 255, 0, 0, 0, 0, 0, 255, 0, 0, 0);
        }
        for (let i = 0; i < max; i++) {
            pos.push(-dists[i], nd, 0, -dists[i], nd, 0, -dists[i], nd, 0, -dists[i + 1], nd, 0, -dists[i + 1], nd, 0, -dists[i + 1], nd, 0);
            weight.push(0, 0, 255, 0, 0, 0, 0, 0, 255, 0, 0, 0);
        }
        for (let i = 0; i < max; i++) {
            pos.push(nd, dists[i], 0, nd, dists[i], 0, nd, dists[i], 0, nd, dists[i + 1], 0, nd, dists[i + 1], 0, nd, dists[i + 1], 0);
            weight.push(0, 1, 255, 1, 0, 1, 0, 1, 255, 1, 0, 1);
        }
        for (let i = 0; i < max; i++) {
            pos.push(nd, -dists[i], 0, nd, -dists[i], 0, nd, -dists[i], 0, nd, -dists[i + 1], 0, nd, -dists[i + 1], 0, nd, -dists[i + 1], 0);
            weight.push(0, 1, 255, 1, 0, 1, 0, 1, 255, 1, 0, 1);
        }
    }
    static prep(view) {
        gl.enable(gl.RASTERIZER_DISCARD);
        gl.useProgram(this.lineGenShader.program);
        const wl = view.getWorldLocation();
        this.lineGenShader.loadVec3(0, wl[0], wl[1], wl[2]);
        this.lineGenShader.loadVec2(1, (this.lineWidth * window.devicePixelRatio + 1) / view.framebuffer.width, (this.lineWidth * window.devicePixelRatio + 1) / view.framebuffer.height);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.TF);
        gl.beginTransformFeedback(gl.POINTS);
        gl.bindVertexArray(this.dataVAO);
        gl.drawArrays(gl.POINTS, 0, this.numLineSegments);
        gl.bindVertexArray(null);
        gl.endTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        gl.useProgram(null);
        gl.disable(gl.RASTERIZER_DISCARD);
    }
    static render() {
        gl.depthMask(false);
        gl.useProgram(this.renderShader.program);
        this.renderShader.loadf(0, (this.lineWidth * window.devicePixelRatio + 1) / 2);
        gl.bindVertexArray(this.VAO);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
        gl.blendEquationSeparate(gl.MAX, gl.MAX);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        gl.disable(gl.BLEND);
        gl.bindVertexArray(null);
        gl.useProgram(null);
        gl.depthMask(true);
    }
}
_a = Grid3D;
Grid3D.minorRange = 200;
Grid3D.majorRange = 500;
Grid3D.vertexShaderCode = `#version 300 es

    layout(location = 0) in vec3 inPos;
    layout(location = 1) in vec2 inOff;
    layout(location = 2) in float inWeight;
    layout(location = 3) in uint axis;
    
    ${ubView}

    uniform float pxLineWidth;

    out vec3 cPos;
    out float weight;
    out vec4 color;
    out float z, maxFade;
    bool isX, isY;

    float rand(float f){
        return fract(sin(f * 100.923) * 43758.5453);
    }

    bool isXAxis(vec3 p){
        return axis == 0u && p.y == 0.0;
    }

    bool isYAxis(vec3 p){
        return axis == 1u && p.x == 0.0;
    }

    bool isMedium(vec3 p){
        return  isX && int(p.y) % 10 == 0 || isY && int(p.x) % 10 == 0;
    }

    bool isLarge(vec3 p){
        return  isX && int(p.y) % 100 == 0 || isY && int(p.x) % 100 == 0;
    }
    const float mediumStartP = ${(_a.minorRange + 10).toFixed(1)}, mediumStartN = -mediumStartP + 10.0;
    const float largeStartP = ${(_a.majorRange + 100).toFixed(1)}, largeStartN = -largeStartP + 100.0;

    bool isMediumLine(vec3 p){
        return isX && (p.y >= mediumStartP || p.y <= mediumStartN) || isY && (p.x >= mediumStartP || p.x <= mediumStartN);
    }

    bool isLargeLine(vec3 p){
        return isX && (p.y >= largeStartP || p.y <= largeStartN) || isY && (p.x >= largeStartP || p.x <= largeStartN);
    }

    #define ${debudHint}
    #define AXIS_COLOR vec4(0.4, 0.4, 0.4, 1.0)
    #define RED vec4(1.0, 0.0, 0.0, 1.0)
    #define GREEN vec4(0.0, 1.0, 0.0, 1.0)

    float linearStep(float min, float max, float v) {
        return clamp((v - min) / (max - min), 0.0, 1.0);
    }
    
    void main(){
        isX = axis == 0u;
        isY = axis == 1u;

        vec3 offset = isLargeLine(inPos) ? vec3(floor(cameraPosition.xy / 100.0) * 100.0, 0.0) : isMediumLine(inPos) ? vec3(floor(cameraPosition.xy / 10.0) * 10.0, 0.0) : vec3(floor(cameraPosition.xy), 0.0);
        vec3 worldPos = inPos;
        vec3 futureWP = worldPos + offset;
        float lineScale = isLarge(futureWP) ? 5.0 : isMedium(futureWP) ? 2.5 : 1.0;
        worldPos *= isX ? vec3(lineScale, 1.0, 0.0) : vec3(1.0, lineScale, 0.0); 
        worldPos += offset;

        #ifdef DEBUG
        color = vec4(rand(float(gl_VertexID / 6)), rand(float(gl_VertexID / 6 + 1)), rand(float(gl_VertexID / 6 + 2)), 1);
        maxFade = 1024.0;

        #else 
        bool isXAxis = isXAxis(worldPos), isYAxis = isYAxis(worldPos);
        color = isXAxis ? RED : isYAxis ? GREEN : AXIS_COLOR;
        maxFade = (isLarge(worldPos) ? 1500.0 : isMedium(worldPos) ? ${(_a.majorRange * 1.5).toFixed(1)} :  ${(_a.minorRange * 1.5).toFixed(1)}) * sqrt(linearStep(0.0, 16.0, abs(cameraPosition.z))); 

        #endif

        cPos = (viewMat * vec4(worldPos, 1)).xyz;
        gl_Position = projectionMat * vec4(cPos, 1);
        gl_Position += vec4(inOff * gl_Position.w, 0,0);

        weight = inWeight * pxLineWidth * gl_Position.w;   
        z = gl_Position.w;  
    }`;
Grid3D.fragmentShaderCode = `#version 300 es
    precision highp float;

    #define ${debudHint}
    
    in vec4 color;
    in float weight;
    in vec3 cPos;
    in float z, maxFade; 

    out vec4 outColor;

    float linearStep(float min, float max, float v) {
        return clamp((v - min) / (max - min), 0.0, 1.0);
    }
    
    void main(){
        float wp = weight / z;
        outColor = color;
        float ff = linearStep(maxFade, 0.0, length(cPos));
        float ff2 = ff * ff;
        #ifndef DEBUG
        outColor.a *= min(wp, 1.0) * ff2 * ff2;
        outColor.rgb *= outColor.a;
        #endif
    }`;
Grid3D.TF = gl.createTransformFeedback();
Grid3D.VAO = gl.createVertexArray();
Grid3D.dataVAO = gl.createVertexArray();
Grid3D.PBO = gl.createBuffer();
Grid3D.OBO = gl.createBuffer();
Grid3D.WBO = gl.createBuffer();
Grid3D.IBO = gl.createBuffer();
Grid3D.numLineSegments = 0;
Grid3D.lineWidth = 1.0;
Grid3D.count = 0;
Grid3D.lineGenShader = new Shader(lineSegmentGeometryGenerationVertexShader, Shader.emptyFragmentShader, ["posOff", "fac"], ["p0OL", "p0OM", "p0OR", "p1OL", "p1OM", "p1OR"], gl.INTERLEAVED_ATTRIBS);
Grid3D.renderShader = new Shader(_a.vertexShaderCode, _a.fragmentShaderCode, ["pxLineWidth"]);
(() => {
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, _a.TF);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, _a.OBO);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    const pos = [];
    const weight = [];
    for (let d = 1; d <= _a.minorRange; d++)
        _a.appendD(pos, weight, d, 1);
    for (let d = _a.minorRange + 10; d <= _a.majorRange; d += 10)
        _a.appendD(pos, weight, d, 10);
    for (let d = _a.majorRange + 100; d <= 1000; d += 100)
        _a.appendD(pos, weight, d, 100);
    gl.bindVertexArray(_a.dataVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, _a.PBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 72, 0);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 72, 36);
    gl.enableVertexAttribArray(1);
    gl.bindVertexArray(_a.VAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, _a.PBO);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    _a.numLineSegments = pos.length / 3 / 6;
    gl.bindBuffer(gl.ARRAY_BUFFER, _a.OBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_a.numLineSegments * 6 * 2), gl.DYNAMIC_COPY);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1);
    gl.bindBuffer(gl.ARRAY_BUFFER, _a.WBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(weight), gl.STATIC_DRAW);
    gl.vertexAttribPointer(2, 1, gl.UNSIGNED_BYTE, true, 2, 0);
    gl.vertexAttribIPointer(3, 1, gl.UNSIGNED_BYTE, 2, 1);
    gl.enableVertexAttribArray(2);
    gl.enableVertexAttribArray(3);
    const ind = [];
    for (let i = 0; i < _a.numLineSegments * 6; i += 6)
        ind.push(i, i + 1, i + 3, i + 3, i + 1, i + 4, i + 1, i + 2, i + 4, i + 4, i + 2, i + 5);
    _a.count = ind.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _a.IBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ind), gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
})();

"use strict";
var _a;
class FrameBuffer {
    constructor() {
        this.width = 16;
        this.height = 16;
        this.renderFBO = gl.createFramebuffer();
        this.renderDepthRB = gl.createRenderbuffer();
        this.renderColorRT = gl.createTexture();
        this.renderPickerRT = gl.createTexture();
        this.debugFBO = gl.createFramebuffer();
        this.debugColorRT = gl.createTexture();
        this.selectionFBO = gl.createFramebuffer();
        this.selectionRT = gl.createTexture();
        this.init(this.width, this.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFBO);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderDepthRB);
        gl.bindTexture(gl.TEXTURE_2D, this.renderColorRT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderColorRT, 0);
        gl.bindTexture(gl.TEXTURE_2D, this.renderPickerRT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.renderPickerRT, 0);
        gl.readBuffer(gl.COLOR_ATTACHMENT0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.debugFBO);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderDepthRB);
        gl.bindTexture(gl.TEXTURE_2D, this.debugColorRT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.debugColorRT, 0);
        gl.readBuffer(gl.COLOR_ATTACHMENT0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.selectionFBO);
        gl.bindTexture(gl.TEXTURE_2D, this.selectionRT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.selectionRT, 0);
        gl.readBuffer(gl.COLOR_ATTACHMENT0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    init(w, h) {
        this.width = w;
        this.height = h;
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderDepthRB);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT32F, w, h);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, this.renderColorRT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindTexture(gl.TEXTURE_2D, this.renderPickerRT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32UI, w, h, 0, gl.RED_INTEGER, gl.UNSIGNED_INT, null);
        gl.bindTexture(gl.TEXTURE_2D, this.selectionRT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32UI, w, h, 0, gl.RED_INTEGER, gl.UNSIGNED_INT, null);
        gl.bindTexture(gl.TEXTURE_2D, this.debugColorRT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    bindRenderFBO() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFBO);
    }
    bindDebug() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.debugFBO);
    }
    bindSelection() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.selectionFBO);
    }
    reset() {
        this.bindRenderFBO();
        gl.clearBufferfv(gl.COLOR, 0, [0.2, 0.2, 0.2, 1]);
        gl.clearBufferuiv(gl.COLOR, 1, [0, 0, 0, 0]);
        gl.clearBufferfv(gl.DEPTH, 0, [1]);
        this.bindDebug();
        gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
        this.bindSelection();
        gl.clearBufferuiv(gl.COLOR, 0, [0, 0, 0, 0]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.width, this.height);
    }
    blitToActiveFramebuffer() {
        gl.bindVertexArray(FrameBuffer.FSQ);
        gl.useProgram(FrameBuffer.FSQShader.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.renderColorRT);
        gl.disable(gl.BLEND);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.useProgram(FrameBuffer.BlitOutlineShader.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.debugColorRT);
        FrameBuffer.BlitOutlineShader.loadui(0, active.index || 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.selectionRT);
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.disable(gl.BLEND);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.useProgram(null);
        gl.bindVertexArray(null);
    }
    deleteTeturesAndRenderBuffers() {
    }
}
_a = FrameBuffer;
FrameBuffer.FSQVertexShaderCode = `#version 300 es
    layout(location = 0) in vec2 p;
    void main(){gl_Position = vec4(p, 0, 1);}
    `;
FrameBuffer.FSQFragmentShader = `#version 300 es
    precision highp float;
    out vec4 outColor;
    uniform sampler2D src;
    ${ubView} 
    void main(){
        outColor = texelFetch(src, ivec2(gl_FragCoord.xy) - viewport.xy, 0);
    }
    `;
FrameBuffer.blitOutlineFragmentShaderCode = `#version 300 es
    precision highp float;
    precision highp int;

    out vec4 outColor;
    uniform sampler2D src;
    uniform highp usampler2D obj;

    ${ubView}
    uniform uint acti;
    #define ACTIVE vec4(1.0, 0.627451, 0.156863, 1.0)
    #define SELECTED vec4(0.929412, 0.341176, 0.0, 1.0)

    uint fetchValue(int x, int y){
        return texelFetch(obj, clamp(ivec2(x, y), ivec2(0), viewport.zw - 1), 0).x;
    }

    const int size = 1;

    vec4 getColor(){
        ivec2 tc = ivec2(gl_FragCoord.xy) - viewport.xy;
        uint comp = fetchValue(tc.x, tc.y);
        uint val1 = fetchValue(tc.x + size, tc.y + size);
        uint val2 = fetchValue(tc.x - size, tc.y + size);
        uint val3 = fetchValue(tc.x - size, tc.y - size);
        uint val4 = fetchValue(tc.x + size, tc.y - size);
        bool touchOther = val1 != comp || val2 != comp || val3 != comp || val4 != comp;
        
        if(comp != 0u) // if this pixel lies on a selected object
            return touchOther ? (comp == acti ? ACTIVE : SELECTED) : texelFetch(src, tc, 0);
        
        // this pixel lies not a selected object
        if(acti == 0u)  // if there is no active object
            return touchOther ? SELECTED : texelFetch(src, tc, 0);

        return touchOther ? (val1 == acti || val2 == acti ||val3 == acti || val4 == acti ? ACTIVE : SELECTED) : texelFetch(src, tc, 0);
    }

    void main(){
        outColor = getColor();
    }
    `;
FrameBuffer.FSQShader = new Shader(FrameBuffer.FSQVertexShaderCode, FrameBuffer.FSQFragmentShader);
FrameBuffer.BlitOutlineShader = new Shader(FrameBuffer.FSQVertexShaderCode, FrameBuffer.blitOutlineFragmentShaderCode, ["acti"]);
FrameBuffer.FSQ = gl.createVertexArray();
FrameBuffer.FSQPBO = gl.createBuffer();
(() => {
    gl.bindVertexArray(_a.FSQ);
    gl.bindBuffer(gl.ARRAY_BUFFER, _a.FSQPBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Int8Array([-1, 1, -1, -1, 1, -1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW, 0);
    gl.vertexAttribPointer(0, 2, gl.BYTE, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    gl.useProgram(FrameBuffer.FSQShader.program);
    gl.uniform1i(gl.getUniformLocation(FrameBuffer.FSQShader.program, "src"), 0);
    gl.useProgram(FrameBuffer.BlitOutlineShader.program);
    gl.uniform1i(gl.getUniformLocation(FrameBuffer.BlitOutlineShader.program, "obj"), 1);
    gl.useProgram(null);
})();

class FrameBuffer {
    static FSQVertexShaderCode = `#version 300 es
    layout(location = 0) in vec2 p;
    void main(){gl_Position = vec4(p, 0, 1);}
    `

    static FSQFragmentShader = `#version 300 es
    precision highp float;
    out vec4 outColor;
    uniform sampler2D src;
    void main(){
        outColor = texelFetch(src, ivec2(gl_FragCoord.xy), 0);
    }
    `

    static blitOutlineFragmentShaderCode = `#version 300 es
    precision highp float;
    precision highp int;

    out vec4 outColor;
    uniform sampler2D src;
    uniform highp usampler2D obj;

    uniform uint acti;
    #define ACTIVE vec4(1.0, 0.627451, 0.156863, 1.0)
    #define SELECTED vec4(0.929412, 0.341176, 0.0, 1.0)

    vec4 getColor(){
        ivec2 tc = ivec2(gl_FragCoord.xy);
        uint comp = texelFetch(obj, tc, 0).x;
        uint val1 = texelFetch(obj, ivec2(tc.x + 1, tc.y + 1), 0).x;
        uint val2 = texelFetch(obj, ivec2(tc.x - 1, tc.y + 1), 0).x;
        uint val3 = texelFetch(obj, ivec2(tc.x - 1, tc.y - 1), 0).x;
        uint val4 = texelFetch(obj, ivec2(tc.x + 1, tc.y - 1), 0).x;
        
        if(comp != 0u)
            return
                val1 != comp ||
                val2 != comp ||
                val3 != comp ||
                val4 != comp ? (comp == acti ? ACTIVE : SELECTED) : texelFetch(src, tc, 0);
        
        if(acti == 0u) 
            return
                val1 != comp ||
                val2 != comp ||
                val3 != comp ||
                val4 != comp ? SELECTED : texelFetch(src, tc, 0);
        
        bool touchSelected = false;

        touchSelected = touchSelected || val1 != comp;
        if(touchSelected && val1 == acti)
            return ACTIVE;

        touchSelected = touchSelected || val2 != comp;
        if(touchSelected && val2 == acti)
            return ACTIVE;

        touchSelected = touchSelected || val3 != comp;
        if(touchSelected && val3 == acti)
            return ACTIVE;

        touchSelected = touchSelected || val4 != comp;
        if(touchSelected && val4 == acti)
            return ACTIVE;

        return touchSelected ? SELECTED : texelFetch(src, tc, 0);
    }

    void main(){
        outColor = getColor();
    }
    `

    static FSQShader = new Shader(FrameBuffer.FSQVertexShaderCode, FrameBuffer.FSQFragmentShader);
    static BlitOutlineShader = new Shader(FrameBuffer.FSQVertexShaderCode, FrameBuffer.blitOutlineFragmentShaderCode, ["selected"]);


    static FSQ = gl.createVertexArray();
    static FSQPBO = gl.createBuffer();
    static {
        gl.bindVertexArray(this.FSQ);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.FSQPBO);
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

    }

    width = 16;
    height = 16;

    renderFBO = gl.createFramebuffer();
    renderDepthRB = gl.createRenderbuffer();
    renderColorRT = gl.createTexture();
    renderPickerRT = gl.createTexture();

    debugFBO = gl.createFramebuffer();
    debugColorRT = gl.createTexture();

    constructor() {
        this.init(this.width, this.height);
        // render FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFBO);

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderDepthRB);
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

        // Debug FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.debugFBO);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderDepthRB);

        gl.bindTexture(gl.TEXTURE_2D, this.debugColorRT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.debugColorRT, 0);

        gl.readBuffer(gl.COLOR_ATTACHMENT0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);

        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    }

    init(w: number, h: number) {
        this.width = w;
        this.height = h;

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderDepthRB);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT32F, w, h);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        gl.bindTexture(gl.TEXTURE_2D, this.renderColorRT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindTexture(gl.TEXTURE_2D, this.renderPickerRT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32UI, w, h, 0, gl.RED_INTEGER, gl.UNSIGNED_INT, null);

        gl.bindTexture(gl.TEXTURE_2D, this.debugColorRT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFBO);
    }

    bindRenderFBO() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFBO);
    }

    bindDebug() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.debugFBO);
    }

    clear() {
        this.bindRenderFBO();
        gl.clearBufferfv(gl.COLOR, 0, [0.2, 0.2, 0.2, 1]);
        gl.clearBufferuiv(gl.COLOR, 1, [0, 0, 0, 0]);
        gl.clearBufferfv(gl.DEPTH, 0, [1]);

        this.bindDebug();
        gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    }

    /**
     * This non transparent function blends this frambuffer to the currently bound framebuffer to drawbuffer at index 0. 
     * This method leaves with the state:
     * `gl.bindTexture(gl.TEXTURE_2D, null); gl.useProgram(null); gl.bindVertexArray(null); gl.disable(gl.BLEND);`.
     * @param src the source image
     * @param dst the destination image
     */
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

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.renderPickerRT);

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
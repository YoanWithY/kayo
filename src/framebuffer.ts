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

    static FSQShader = new Shader(FrameBuffer.FSQVertexShaderCode, FrameBuffer.FSQFragmentShader);

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
        gl.useProgram(null);

    }

    width = 16;
    height = 16;

    renderFBO = gl.createFramebuffer();
    renderDepthStencil = gl.createRenderbuffer();
    renderColorRT = gl.createTexture();

    debugFBO = gl.createFramebuffer();
    debugColorRT = gl.createTexture();

    constructor() {
        // render FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFBO);

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderDepthStencil);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderDepthStencil);

        gl.bindTexture(gl.TEXTURE_2D, this.renderColorRT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderColorRT, 0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.readBuffer(gl.COLOR_ATTACHMENT0);

        // Debug FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.debugFBO);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderDepthStencil);

        gl.bindTexture(gl.TEXTURE_2D, this.debugColorRT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.debugColorRT, 0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.readBuffer(gl.COLOR_ATTACHMENT0);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.init(this.width, this.height);
    }

    init(w: number, h: number) {
        this.width = w;
        this.height = h;

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderDepthStencil);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT32F, w, h);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        gl.bindTexture(gl.TEXTURE_2D, this.renderColorRT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

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

    /**
     * This non transparent function blends the source image over the destination image using straight alpha blend over. 
     * This method leaves with the state:
     * `gl.bindTexture(gl.TEXTURE_2D, null); gl.useProgram(null); gl.bindVertexArray(null); gl.disable(gl.BLEND);`..
     * @param src the source image
     * @param dst the destination image
     */
    static blend(...T: { blend?: { src: number, dst: number; }, tex: (WebGLTexture | null)[] }[]) {
        gl.bindVertexArray(FrameBuffer.FSQ);
        gl.useProgram(FrameBuffer.FSQShader.program);
        gl.activeTexture(gl.TEXTURE0);

        for (const te of T) {
            if (te.blend) {
                gl.enable(gl.BLEND);
                gl.blendFunc(te.blend.src, te.blend.dst);
                gl.blendEquation(gl.FUNC_ADD);
            } else
                gl.disable(gl.BLEND);

            for (const texture of te.tex) {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
        }

        gl.disable(gl.BLEND);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.useProgram(null);
        gl.bindVertexArray(null);
    }

    deleteTeturesAndRenderBuffers() {

    }
}
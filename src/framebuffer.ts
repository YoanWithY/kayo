class FrameBuffer {
    static blendVertexShaderCode = `#version 300 es
    layout(location = 0) in vec2 p;
    void main(){gl_Position = vec4(p, 0, 1);}
    `

    static blendFragmentShaderCode = `#version 300 es
    precision highp float;
    out vec4 outColor;
    uniform sampler2D texture;
    void main(){
        outColor = texelFetch(texture, ivec2(gl_FragCoord.xy), 0);
    }
    `
    static blendShader = new Shader(FrameBuffer.blendVertexShaderCode, FrameBuffer.blendFragmentShaderCode);
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
    }

    width = 16;
    height = 16;

    finalFBO = gl.createFramebuffer();
    finalDepthStencil = gl.createRenderbuffer();
    finalColorRT = gl.createTexture();

    debugFBO = gl.createFramebuffer();
    debugColorRT = gl.createTexture();

    constructor() {
        // final FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.finalFBO);

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.finalDepthStencil);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.finalDepthStencil);

        gl.bindTexture(gl.TEXTURE_2D, this.finalColorRT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.finalColorRT, 0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.readBuffer(gl.COLOR_ATTACHMENT0);

        // Debug FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.debugFBO);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.finalDepthStencil);

        gl.bindTexture(gl.TEXTURE_2D, this.debugColorRT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.debugColorRT, 0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.readBuffer(gl.COLOR_ATTACHMENT0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        this.init(this.width, this.height);
    }

    init(w: number, h: number) {
        this.width = w;
        this.height = h;

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.finalDepthStencil);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, w, h);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        gl.bindTexture(gl.TEXTURE_2D, this.finalColorRT);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindTexture(gl.TEXTURE_2D, this.debugColorRT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    bindFinal(target: number) {
        gl.bindFramebuffer(target, this.finalFBO);
    }

    bindDebug() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.debugFBO);
    }

    static blend(src: WebGLTexture | null, dest: FrameBuffer) {

        gl.bindFramebuffer(gl.FRAMEBUFFER, dest.finalFBO);
        gl.bindVertexArray(FrameBuffer.FSQ);
        gl.useProgram(FrameBuffer.blendShader.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, src);

        gl.viewport(0, 0, dest.width, dest.height);
        gl.enable(gl.BLEND);
        // gl.blendFuncSeparate()
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.disable(gl.BLEND);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.useProgram(null);
        gl.bindVertexArray(null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    deleteTeturesAndRenderBuffers() {

    }
}
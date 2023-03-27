"use strict";
let shader;
let shader2d;
let mat = new material();
mat.setTexture(0, "TexturesCom_Tiles_Decorative_1K_albedo.png");
let objs = [];
function init() {
    if (!gl)
        return;
    shader = new Shader(Shader.defaultVertexShaderCode, Shader.defaultFragmentShaderCode, ["index"]);
    gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.viewUB);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array(projection.concat(mat4.identity())));
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    gl.disable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.modelTransformationUB);
    for (let i = 0; i < 100; i++) {
        objs.push(new Cube(i));
        const ts = objs[i].transformationStack;
        ts[1].setValues(Math.random(), Math.random(), Math.random());
        ts[2].setValues(Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50);
        Shader.loadModelMatrix(i, ts.getTransformationMatrix());
    }
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    setupCanvas();
    window.requestAnimationFrame(renderloop);
}
let frameCounter = 0;
let prevTime = 0;
let prevFPS = [];
const fpsElem = document.querySelector("#fps");
function avg(arr) {
    let sum = 0;
    arr.forEach(v => sum += v);
    return sum / arr.length;
}
function renderloop(timestamp) {
    let val = timestamp / 10000;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const color = SplitPaneDivider.color;
    gl.clearColor(color[0] / 255, color[1] / 255, color[2] / 255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    mat.bindTextures();
    for (const view of ViewPortPane.viewports) {
        view.phi = val;
        Shader.updateView(view);
        view.framebuffer.bindFinal(gl.FRAMEBUFFER);
        gl.clearColor(1, 1, 1, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(shader.program);
        for (let i = 0; i < objs.length; i++) {
            let o = objs[i];
            shader.loadui(0, o.index);
            o.bind();
            o.render();
        }
        view.framebuffer.bindDebug();
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        Grid3D.prep(view);
        Grid3D.render();
        FrameBuffer.blend(view.framebuffer.debugColorRT, view.framebuffer);
        view.blit();
    }
    prevFPS[frameCounter % 16] = Math.round(1000 / (timestamp - prevTime));
    fpsElem.textContent = (avg(prevFPS)).toFixed(0);
    prevTime = timestamp;
    frameCounter++;
    window.requestAnimationFrame(renderloop);
}
init();

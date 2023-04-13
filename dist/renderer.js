"use strict";
let shader;
let selectionShader;
let mat = new material();
mat.setTexture(0, "TexturesCom_Tiles_Decorative_1K_albedo.png");
let objs = [new MeshObject(0)];
let selected = [];
let active;
function init() {
    if (!gl)
        return;
    shader = new Shader(Shader.defaultVertexShaderCode, Shader.defaultFragmentShaderCode, ["index"]);
    gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.viewUB);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array(projection.concat(mat4.identity())));
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    selectionShader = new Shader(Shader.geometryOnlyVertexShaderCode, Shader.indexOutputFragmentShaderCode, ["index"]);
    gl.disable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.modelTransformationUB);
    const generateRandom = 100;
    const generator = [BasicMesh.appendCone, BasicMesh.appendCube, BasicMesh.appendTorus, BasicMesh.appendUVSphere];
    for (let i = 1; i <= generateRandom; i++) {
        const o = generator[i % generator.length].call(BasicMesh, new MeshObject(i));
        o.createAndBuildVAO();
        objs.push(o);
        const ts = objs[i].transformationStack;
        ts[1].setValues(Math.random() * 3, Math.random() * 3, 0);
        ts[2].setValues(Math.random() * 50 - 25, Math.random() * 50 - 25, Math.random() * 50 - 25);
        Shader.loadModelMatrix(i, ts.getTransformationMatrix());
    }
    let o = BasicMesh.appendZFunktion(new MeshObject(generateRandom + 1), (u, v) => {
        return Math.sin(u) * Math.sin(v);
    });
    o.createAndBuildVAO();
    objs.push(o);
    Shader.loadModelMatrix(generateRandom + 1, o.transformationStack.getTransformationMatrix());
    active = objs[generateRandom + 1];
    selected = [objs[1], objs[2], objs[3], objs[4], objs[5]];
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
    let val = timestamp / 5000;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const color = SplitPaneDivider.color;
    gl.clearColor(color[0] / 255, color[1] / 255, color[2] / 255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    mat.bindTextures();
    for (const view of ViewPortPane.viewports) {
        Shader.updateView(view);
        view.framebuffer.reset();
        view.framebuffer.bindRenderFBO();
        gl.useProgram(shader.program);
        for (let i = 0; i < objs.length; i++) {
            let o = objs[i];
            shader.loadui(0, o.index);
            o.bindAndRender();
        }
        view.framebuffer.bindDebug();
        Grid3D.prep(view);
        Grid3D.render();
        gl.useProgram(selectionShader.program);
        view.framebuffer.bindSelection();
        for (const o of selected.concat([active])) {
            selectionShader.loadui(0, o.index);
            o.bindAndRender();
        }
        view.applyToCanvas();
    }
    prevFPS[frameCounter % 16] = Math.round(1000 / (timestamp - prevTime));
    fpsElem.textContent = (avg(prevFPS)).toFixed(0);
    prevTime = timestamp;
    frameCounter++;
    window.requestAnimationFrame(renderloop);
}
init();

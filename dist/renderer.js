"use strict";
let shader;
let shader2d;
let mat = new material();
mat.setTexture(0, "TexturesCom_Tiles_Decorative_1K_albedo.png");
let objs = [];
let line = new Lines(1);
line.appendLongLine([0, 0, 0], [1, 0, 0], [1, 0, 0, 0.4]);
line.appendLongLine([0, 0, 0], [0, 1, 0], [0, 1, 0, 0.4]);
line.appendLongLine([0, 0, 0], [0, 0, 1], [0, 0, 1, 0.4]);
line.appendGrid(50);
line.build();
function init() {
    if (!gl)
        return;
    shader = new Shader(Shader.defaultVertexShaderCode, Shader.defaultFragmentShaderCode, "index");
    gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.viewUB);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array(projection.concat(mat4.identity())));
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    shader2d = new Shader(Shader.defaultLineVertexShaderCode, Shader.defaultLineFragmentShaderCode);
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
let prevTime = 0;
const fpsElem = document.querySelector("#fps");
function renderloop(timestamp) {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    mat.bindTextures();
    gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.viewUB);
    let val = timestamp / 10000;
    let viewMat = mat4.rotateZ(mat4.rotateX(mat4.translate(mat4.rotationX(toRAD(-90)), 0, 10, 0), 0.5), val);
    Shader.loadViewMatrix(viewMat);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    gl.useProgram(shader.program);
    for (let i = 0; i < objs.length; i++) {
        let o = objs[i];
        shader.loadui(0, o.index);
        o.bind();
        o.render();
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(shader2d.program);
    line.prepAndRender(mat4.mult(projection, viewMat));
    gl.disable(gl.BLEND);
    window.requestAnimationFrame(renderloop);
    fpsElem.textContent = (1000 / (timestamp - prevTime)).toFixed(0);
    prevTime = timestamp;
}
init();

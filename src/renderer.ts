"use strict";
let shader: Shader;
let shader2d: Shader;
let mat = new material();
mat.setTexture(0, "TexturesCom_Tiles_Decorative_1K_albedo.png");
// mat.setTexture(0, "birch_log.png");
let objs: glObject[] = [];
let line = new Lines(1);
line.appendLongLine([0, 0, 0], [1, 0, 0], [1, 0, 0, 0.4]);
line.appendLongLine([0, 0, 0], [0, 1, 0], [0, 1, 0, 0.4]);
line.appendLongLine([0, 0, 0], [0, 0, 1], [0, 0, 1, 0.4]);
line.appendGrid(30);
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
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.modelTransformationUB);
    objs.push(new Cube(0));
    const ts = objs[0].transformationStack;
    ts[0].setValues(1, 1, 1);
    ts[2].setValues(1, 1, 1);
    Shader.loadModelMatrix(0, ts.getTransformationMatrix());
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    setupCanvas();
    window.requestAnimationFrame(renderloop);
}
let prevTime = 0;
const fpsElem = document.querySelector("#fps") as HTMLSpanElement;
function renderloop(timestamp: number) {

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    mat.bindTextures();
    gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.viewUB);

    let val = timestamp / 5000;
    let viewMat = mat4.rotateZ(mat4.rotateX(mat4.translate(mat4.rotationX(toRAD(-90)), 0, 10, 0), 0.4), val);
    Shader.loadViewMatrix(viewMat);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    gl.useProgram(shader.program);
    for (let i = 0; i < 1; i++) {
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

// let s = "return ["
// for (let r = 0; r < 16; r += 4) {
//     for (let c = 0; c < 4; c++)
//         s += `b[${r}]*a[${c}]+b[${r + 1}]*a[${4 + c}]+b[${r + 2}]*a[${8 + c}]+b[${r + 3}]*a[${12 + c}],`;
// }
// console.log(s);

// traspose
// let s = "return ["
// for (let r = 0; r < 4; r++) {
//     for (let c = 0; c < 4; c++)
//         s += `m[${4 * c + r}],`;
// }
// console.log(s);

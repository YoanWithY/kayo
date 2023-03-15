"use strict";
let shader: Shader;
let shader2d: Shader;
let mat = new material();
let cam = new Camera();
mat.setTexture(0, "TexturesCom_Tiles_Decorative_1K_albedo.png");
// mat.setTexture(0, "birch_log.png");
let objs: glObject[] = [];
function init() {
    if (!gl)
        return;

    shader = new Shader(Shader.defaultVertexShaderCode, Shader.defaultFragmentShaderCode, ["index"]);
    gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.viewUB);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array(projection.concat(mat4.identity())));
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    // transformfeedback for dynamic grid generation

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

    cam.transformationStack[2].setValues(0, 0, 10);

    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    setupCanvas();
    window.requestAnimationFrame(renderloop);
}
let frameCounter = 0;
let prevTime = 0;
let prevFPS: number[] = [];
const fpsElem = document.querySelector("#fps") as HTMLSpanElement;

function avg(arr: number[]) {
    let sum = 0;
    arr.forEach(v => sum += v);
    return sum / arr.length;
}

function renderloop(timestamp: number) {

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    mat.bindTextures();
    gl.bindBuffer(gl.UNIFORM_BUFFER, Shader.viewUB);

    let val = timestamp / 5000;
    // let viewMat = mat4.rotateZ(mat4.rotateX(mat4.translate(mat4.rotationX(toRAD(-90)), 0, 10, 0), 0.5), val);
    cam.transformationStack[2].setValues(-400 * Math.sin(val), -400 * Math.cos(val), 50 * Math.sin(val));
    cam.transformationStack[1].setValues(toRAD(90), -val, 0);
    let viewMat = cam.getViewMatrix();
    Shader.loadViewMatrix(viewMat);
    Shader.loadCameraPosition(cam.getWorldLocation());
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    gl.useProgram(shader.program);
    for (let i = 0; i < objs.length; i++) {
        let o = objs[i];
        shader.loadui(0, o.index);
        o.bind();
        o.render();
    }

    Grid3D.prep(cam.getWorldLocation());
    Grid3D.render();

    window.requestAnimationFrame(renderloop);

    prevFPS[frameCounter % 16] = Math.round(1000 / (timestamp - prevTime));
    fpsElem.textContent = (avg(prevFPS)).toFixed(0);
    prevTime = timestamp;
    frameCounter++;
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

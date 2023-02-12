"use strict";
let projection = mat4.perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 1000);
let shader = null;
let mat = new material();
mat.setTexture(0, "TexturesCom_Tiles_Decorative_1K_albedo.png");

function init() {
    if (!gl)
        return;

    shader = new Shader(Shader.defaultVertexShaderCode, Shader.defaultFragmentShaderCode, "TMat");
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shader.program);
    window.requestAnimationFrame(renderloop);
}

function renderloop(timestamp) {
    Cube.bind();
    mat.bindTextures();
    const val = timestamp / 2000;
    shader.loadMat4(0, mat4.rotateX(mat4.rotateY(mat4.translate(projection, 0, 0.5 * Math.cos(val), -5), val), val));
    Cube.render();
    window.requestAnimationFrame(renderloop);
}

init();

// let s = "return ["
// for (let r = 0; r < 16; r += 4) {
//     for (let c = 0; c < 4; c++)
//         s += `a[${r}]*b[${c}]+a[${r + 1}]*b[${4 + c}]+a[${r + 2}]*b[${8 + c}]+a[${r + 3}]*b[${12 + c}],`;
// }
// console.log(s);

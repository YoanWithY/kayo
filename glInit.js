"use strict";
const glCanvas = document.getElementById("glCanvas");
const gl = glCanvas.getContext("webgl2");
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

function setupCanvas(canvas) {
    // Get the device pixel ratio, falling back to 1.
    var dpr = window.devicePixelRatio || 1;
    // Get the size of the canvas in CSS pixels.
    var rect = canvas.getBoundingClientRect();
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

}

setupCanvas(glCanvas);

async function textFromFile(file) {
    return await (await fetch(file)).text();
}
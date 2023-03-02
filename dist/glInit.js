"use strict";
const glCanvas = document.getElementById("glCanvas");
const gl = glCanvas.getContext("webgl2", { antialias: true });
const extTFA = gl.getExtension("EXT_texture_filter_anisotropic");
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

"use strict";
const glCanvas = document.getElementById("glCanvas") as HTMLCanvasElement;
const gl = glCanvas.getContext("webgl2", { antialias: true, powerPreference: "high-performance" }) as WebGL2RenderingContext;
const extTFA = gl.getExtension("EXT_texture_filter_anisotropic") as EXT_texture_filter_anisotropic;
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
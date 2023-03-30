"use strict";
const glCanvas = document.getElementById("glCanvas") as HTMLCanvasElement;
const gl = glCanvas.getContext("webgl2", { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false, powerPreference: "high-performance" }) as WebGL2RenderingContext;
const extTFA = gl.getExtension("EXT_texture_filter_anisotropic") as EXT_texture_filter_anisotropic;
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
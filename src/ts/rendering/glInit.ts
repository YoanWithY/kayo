import '../../css/style.css'
import '../../css/ui-styles.css'
import { ViewportPane } from "../ui/ViewportPane";

export let glCanvas: HTMLCanvasElement;
export let gl: WebGL2RenderingContext;
export let extTFA: EXT_texture_filter_anisotropic;

glCanvas = document.getElementById("glCanvas") as HTMLCanvasElement;
if (glCanvas === null || !(glCanvas instanceof HTMLCanvasElement))
    throw new Error("No glCanvas!");

gl = glCanvas.getContext("webgl2", { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false, powerPreference: "high-performance" }) as WebGL2RenderingContext;
if (!(gl instanceof WebGL2RenderingContext))
    throw new Error("No WebGL 2!");
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

extTFA = gl.getExtension("EXT_texture_filter_anisotropic") as EXT_texture_filter_anisotropic;
if (extTFA === null)
    throw new Error("No extTFA");

function setupCanvas() {
    // Get the device pixel ratio, falling back to 1.
    let dpr = window.devicePixelRatio || 1;

    let width = glCanvas.clientWidth;
    let height = glCanvas.clientHeight;
    if (glCanvas.width != width || glCanvas.height != height) {
        glCanvas.width = width * dpr;
        glCanvas.height = height * dpr;
    }
}

window.addEventListener('resize', setupCanvas);
setupCanvas();

export function getGLViewport(vpp: ViewportPane): [number, number, number, number] {
    const rect = vpp.getBoundingClientRect();
    const dpr = window.devicePixelRatio;
    return [rect.left * dpr, gl.canvas.height - rect.bottom * dpr, vpp.camera.width, vpp.camera.height];
}



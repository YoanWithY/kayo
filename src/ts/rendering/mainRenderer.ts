import Scene from "../project/Scene";
import { scene } from "../projection/Projection";
import ShaderProgram from "../shader/ShaderProgram";
import { ViewportPane } from "../ui/ViewportPane";
import { getGLViewport, gl } from "./glInit";

let frameCounter = 0;
let prevTime = 0;
let prevFPS: number[] = [];
const fpsElem = document.querySelector("#fps") as HTMLSpanElement;

function avg(arr: number[]) {
    let sum = 0;
    arr.forEach(v => sum += v);
    return sum / arr.length;
}

export default function renderloop(timestamp: number) {
    let val = timestamp / 5000;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(val % 1, 1, 1, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let viewport of ViewportPane.viewports) {
        ShaderProgram.updateView(viewport, frameCounter);
        const cam = viewport.camera;
        const fb = cam.framebuffer;

        fb.reset();
        fb.bindRenderFBO();

        scene.render(cam);

        const bb = getGLViewport(viewport);
        gl.viewport(...bb);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        fb.blitToActiveFramebuffer();
    }

    prevFPS[frameCounter % 16] = Math.round(1000 / (timestamp - prevTime));
    fpsElem.textContent = (avg(prevFPS)).toFixed(0);
    prevTime = timestamp;
    frameCounter++;
    window.requestAnimationFrame(renderloop);
}
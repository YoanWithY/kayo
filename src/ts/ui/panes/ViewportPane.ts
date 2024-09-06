import ViewportCamera from "../../Viewport/ViewportCamera";
import vec2 from "../../math/vec2";
import vec3 from "../../math/vec3";
import { openProject } from "../../project/Project";
import { Viewport } from "../../rendering/Viewport";
import LookAtTransform from "../../transformation/LookAt";

export class ViewportPane extends HTMLElement implements Viewport {
	static viewportPanes = new Set<ViewportPane>;

	public camera = new ViewportCamera();
	public canvasContext: GPUCanvasContext;
	public canvas: HTMLCanvasElement;
	public lable = "My Viewport";

	resizeObserver: ResizeObserver = new ResizeObserver((e) => {
		const size = e[0].devicePixelContentBoxSize[0];
		this.canvas.width = size.inlineSize;
		this.canvas.height = size.blockSize;
		if (this.isConnected)
			openProject.renderer.requestAnimationFrameWith(this);
	});

	constructor() {
		super();

		this.canvas = document.createElement("canvas");
		this.canvasContext = this.canvas.getContext("webgpu") as GPUCanvasContext;

		this.resizeObserver.observe(this, {
			box: "device-pixel-content-box"
		});

		const lookAt = new LookAtTransform();
		this.camera.transformationStack.push(lookAt);

		const rotateView = (dx: number, dy: number) => {
			lookAt.phi -= dx / 256;
			lookAt.theta -= dy / 256;
		}

		const shiftView = (dx: number, dy: number) => {
			const lat = vec3.latitudeTangent(lookAt.phi);
			const lon = vec3.longitudeTangent(lookAt.theta, lookAt.phi);
			lookAt.p = lookAt.p.add(lat.mulS(-dx / 1024 * lookAt.r).add(lon.mulS(-dy / 1024 * lookAt.r)));
		}

		const move = (e: MouseEvent) => {
			if (e.shiftKey)
				shiftView(e.movementX, e.movementY)
			else
				rotateView(e.movementX, e.movementY);
		}

		const mm = (e: MouseEvent) => {
			if (e.buttons === 1 && !document.pointerLockElement) {
				this.requestPointerLock();
				this.addEventListener("mousemove", move);
				move(e);
			}
		}

		this.onmousedown = () => {
			this.addEventListener("mousemove", mm);
		}

		this.onmouseup = () => {
			this.removeEventListener("mousemove", move);
			this.removeEventListener("mousemove", mm);
			document.exitPointerLock();
		}

		this.addEventListener("wheel", e => {
			e.preventDefault();
			const val = e.deltaY / window.devicePixelRatio;
			lookAt.r += lookAt.r * val / 1024;
		});

		const touches: Touch[] = [];
		this.addEventListener("touchstart", e => {
			for (const t of e.touches)
				touches[t.identifier] = t;
		});
		this.addEventListener("touchmove", e => {
			if (e.touches.length === 1) {
				const thisT = e.touches[0];
				const lastT = touches[thisT.identifier];
				rotateView(thisT.clientX - lastT.clientX, thisT.clientY - lastT.clientY);
				touches[thisT.identifier] = thisT;
			} else if (e.touches.length === 2) {
				const thisT1 = e.touches[0];
				const lastT1 = touches[thisT1.identifier];
				const thisT2 = e.touches[1];
				const lastT2 = touches[thisT2.identifier];
				const dx1 = thisT1.clientX - lastT1.clientX;
				const dy1 = thisT1.clientY - lastT1.clientY;
				const dx2 = thisT2.clientX - lastT2.clientX;
				const dy2 = thisT2.clientY - lastT2.clientY;
				const lastD = vec2.distance(lastT1.clientX, lastT1.clientY, lastT2.clientX, lastT2.clientY);
				const thisD = vec2.distance(thisT1.clientX, thisT1.clientY, thisT2.clientX, thisT2.clientY);
				const zoom = lastD / thisD;
				touches[thisT1.identifier] = thisT1;
				touches[thisT2.identifier] = thisT2;
				lookAt.r *= zoom;
				shiftView((dx1 + dx2) / 2, (dy1 + dy2) / 2);
			}
		});
		this.addEventListener("touchend", e => {
			for (const t of e.changedTouches)
				delete touches[t.identifier];
		})
	}

	getCurrentTexture(): GPUTexture {
		return this.canvasContext.getCurrentTexture();
	}

	setGPUTime(time: number): void {
		time;
	}

	connectedCallback() {
		ViewportPane.viewportPanes.add(this);
		console.log("con");
		openProject.renderer.registerViewport(this);
	}

	disconnectedCallback() {
		ViewportPane.viewportPanes.delete(this);
		console.log("dis");

		openProject.renderer.unregisterViewport(this);
	}

	static createViewportPane() {
		const p = document.createElement("viewport-pane") as ViewportPane;
		p.appendChild(p.canvas);
		return p;
	}
}

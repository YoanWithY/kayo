import { Kayo } from "../../Kayo";
import ViewportCamera from "../../Viewport/ViewportCamera";
import vec2 from "../../math/vec2";
import vec3 from "../../math/vec3";
import { Project } from "../../project/Project";
import { Viewport } from "../../rendering/Viewport";
import LookAtTransform from "../../transformation/LookAt";
import BasicPane from "./BasicPane";
import viewportPaneTemplate from "./ViewportPaneTemplate.json";

export class ViewportPane extends BasicPane implements Viewport {
	public camera = new ViewportCamera();
	public canvasContext!: GPUCanvasContext;
	public canvas!: HTMLCanvasElement;
	public lable = "My Viewport";
	public project!: Project;
	public window!: Window;
	public configKey: string = "default";

	private _resizeObserver: ResizeObserver = new ResizeObserver((e) => {
		const size = e[0].devicePixelContentBoxSize[0];
		this.canvas.width = size.inlineSize;
		this.canvas.height = size.blockSize;
		if (this.isConnected) this.project.renderer.requestAnimationFrameWith(this);
	});

	private _infoPane!: HTMLDivElement;

	public constructor() {
		super();

		const lookAt = new LookAtTransform(new vec3(8, 8, 8), 5);
		this.camera.transformationStack.push(lookAt);

		const rotateView = (dx: number, dy: number) => {
			lookAt.phi -= dx / 256;
			lookAt.theta -= dy / 256;
		};

		const shiftView = (dx: number, dy: number) => {
			const lat = vec3.latitudeTangent(lookAt.phi);
			const lon = vec3.longitudeTangent(lookAt.theta, lookAt.phi);
			lookAt.p = lookAt.p.add(lat.mulS((-dx / 256) * lookAt.r).add(lon.mulS((-dy / 256) * lookAt.r)));
		};

		const orbitMove = (e: MouseEvent) => {
			if (e.shiftKey) shiftView(e.movementX, e.movementY);
			else rotateView(e.movementX, e.movementY);
			this.project.renderer.requestAnimationFrameWith(this);
		};

		const walkLook = (e: MouseEvent) => {
			const camPos1 = this.camera.getWorldLocation();
			const dphi = e.movementX / 256;
			const dtheta = e.movementY / 256;
			lookAt.phi -= dphi;
			lookAt.theta -= dtheta;
			const camPos2 = this.camera.getWorldLocation();
			lookAt.p = lookAt.p.add(camPos1.sub(camPos2));
			this.project.renderer.requestAnimationFrameWith(this);
		};

		const keyMap: any = {};
		const speed = 0.25;
		const mm = (e: MouseEvent) => {
			if (document.pointerLockElement) return;
			this.requestPointerLock();
			if (e.buttons === 4) {
				this.addEventListener("mousemove", orbitMove);
				orbitMove(e);
			} else if (e.buttons === 2) {
				this.addEventListener("mousemove", walkLook);
				walkLook(e);
				const walkMove = () => {
					const mat = this.camera.transformationStack.getTransformationMatrix();
					if (keyMap["w"]) {
						lookAt.p = lookAt.p.sub(mat.getColumn(2).xyz.mulS(speed));
						this.project.renderer.requestAnimationFrameWith(this);
					}

					if (keyMap["s"]) {
						lookAt.p = lookAt.p.sub(mat.getColumn(2).xyz.mulS(-speed));
						this.project.renderer.requestAnimationFrameWith(this);
					}

					if (keyMap["a"]) {
						lookAt.p = lookAt.p.sub(mat.getColumn(0).xyz.mulS(speed));
						this.project.renderer.requestAnimationFrameWith(this);
					}

					if (keyMap["d"]) {
						lookAt.p = lookAt.p.sub(mat.getColumn(0).xyz.mulS(-speed));
						this.project.renderer.requestAnimationFrameWith(this);
					}
				};
				walkMove();
			}
		};

		document.body.addEventListener("keydown", (e) => (keyMap[e.key] = true));
		document.body.addEventListener("keyup", (e) => delete keyMap[e.key]);

		this.onmousedown = (e) => {
			e.preventDefault();
			this.addEventListener("mousemove", mm);
		};

		this.onmouseup = () => {
			this.removeEventListener("mousemove", walkLook);
			this.removeEventListener("mousemove", orbitMove);
			this.removeEventListener("mousemove", mm);
			document.exitPointerLock();
		};

		this.addEventListener(
			"wheel",
			(e) => {
				e.preventDefault();
				const val = e.deltaY / this.window.devicePixelRatio;
				lookAt.r += (lookAt.r * val) / 1024;
				this.project.renderer.requestAnimationFrameWith(this);
			},
			{ passive: false },
		);

		const touches: Touch[] = [];
		this.addEventListener(
			"touchstart",
			(e) => {
				for (const t of e.touches) touches[t.identifier] = t;
			},
			{ passive: false },
		);
		this.addEventListener(
			"touchmove",
			(e) => {
				this.project.renderer.requestAnimationFrameWith(this);
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
			},
			{ passive: false },
		);
		this.addEventListener("touchend", (e) => {
			for (const t of e.changedTouches) delete touches[t.identifier];
		});

		const keyListener = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.shiftKey && e.key === " ") {
				this.requestFullscreen();
				this.project.fullRerender();
			}
		};
		this.addEventListener("mouseenter", () => {
			this.window.addEventListener("keydown", keyListener);
		});
		this.addEventListener("mouseleave", () => {
			this.window.removeEventListener("keydown", keyListener);
		});
	}

	public useOverlays: boolean = false;

	private viewBuffer = new Float32Array(3 * 16 + 2 * 4);
	private viewTimeBuffer = new Uint32Array(8);
	public updateView(viewUBO: GPUBuffer, frame: number): void {
		const near = this.camera.projection.near;
		const far = this.camera.projection.far;
		this.camera.getViewMatrix().pushInFloat32ArrayColumnMajor(this.viewBuffer);
		this.camera
			.getProjection()
			.getProjectionMatrix(this.canvas.width, this.canvas.height)
			.pushInFloat32ArrayColumnMajor(this.viewBuffer, 16);
		this.camera.transformationStack
			.getTransformationMatrix()
			.pushInFloat32ArrayColumnMajor(this.viewBuffer, 2 * 16);
		this.viewBuffer.set(
			[
				near,
				far,
				this.window.devicePixelRatio,
				0, // exposure
				1, // gamma
				256, // number of red colors, min 2^1, max 2^16
				256, // number of red colors, min 2^1, max 2^16
				256, // number of red colors, min 2^1, max 2^16
			],
			3 * 16,
		);
		this.project.gpux.gpuDevice.queue.writeBuffer(viewUBO, 0, this.viewBuffer);

		this.viewTimeBuffer.set([0, 0, this.canvas.width, this.canvas.height, frame, 0, 0, 0], 0);
		this.project.gpux.gpuDevice.queue.writeBuffer(viewUBO, this.viewBuffer.byteLength, this.viewTimeBuffer);
	}

	public getCurrentTexture(): GPUTexture {
		return this.canvasContext.getCurrentTexture();
	}

	public setGPUTime(times: any): void {
		let html = `
		<style>
		table td:first-child {
			text-align: left;
			padding-right: 8px;
		}
		table td:last-child {
			text-align: right;
			font-family: monospace;
		}
		</style>

		<table>
			<tr>
				<td>Category</td>
				<td>ms</td>
			</tr>`;
		for (const key in times) {
			html += `
			<tr>
				<td>${key}</td>
				<td>${times[key].toFixed(2)}</td>
			</tr>`;
		}
		html += `</table>`;
		this._infoPane.innerHTML = html;
	}

	protected connectedCallback() {
		this.project.renderer.viewportPanes.add(this);
		this.project.renderer.registerViewport(this);
		this._resizeObserver.observe(this, {
			box: "device-pixel-content-box",
		});
	}

	protected disconnectedCallback() {
		this.project.renderer.viewportPanes.delete(this);
		this.project.renderer.unregisterViewport(this);
		this._resizeObserver.unobserve(this);
	}

	public static createUIElement(win: Window, kayo: Kayo): ViewportPane {
		const p = super.createUIElement(win, kayo, viewportPaneTemplate) as ViewportPane;
		p._infoPane = win.document.createElement("div");
		p._infoPane.setAttribute(
			"style",
			"position: absolute; left: 10px; bottom: 10px; display: inline; color: white; backdrop-filter: blur(73px); 	background-color: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.25); border-radius: 4px;",
		);
		p.canvas = win.document.createElement("canvas");
		p.canvasContext = p.canvas.getContext("webgpu") as GPUCanvasContext;
		p.window = win;
		p.setAttribute("tabindex", "-1");
		p.focus();
		p.project = p.kayo.project;
		p.appendChild(p.canvas);
		p.appendChild(p._infoPane);
		return p;
	}

	public static getDomClass() {
		return "viewport-pane";
	}

	public static getName() {
		return "3D Viewport";
	}
}

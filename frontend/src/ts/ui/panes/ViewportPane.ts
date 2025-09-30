import { RenderConfig } from "../../../c/KayoCorePP";
import { Kayo } from "../../Kayo";
import { debounce } from "../../Utils";
import ViewportCamera from "../../Viewport/ViewportCamera";
import vec2 from "../../math/vec2";
import vec3 from "../../math/vec3";
import { Project } from "../../project/Project";
import { Viewport } from "../../rendering/Viewport";
import LookAtTransform from "../../transformation/LookAt";

export class ViewportPane extends HTMLElement implements Viewport {
	private _kayo!: Kayo;
	public camera = new ViewportCamera();
	public canvasContext!: GPUCanvasContext;
	public canvas!: HTMLCanvasElement;
	public lable = "My Viewport";
	public project!: Project;
	public window!: Window;
	public config!: RenderConfig;
	protected _lookAt = new LookAtTransform(new vec3(8, 8, 8), 5);

	private _resizeCallback = (e: ResizeObserverEntry[]) => {
		const size = e[0].devicePixelContentBoxSize[0];
		this.canvas.width = size.inlineSize;
		this.canvas.height = size.blockSize;
		if (this.isConnected) this.project.requestAnimationFrameWith(this);
	};
	private _resizeCallbackDebunced = debounce(this._resizeCallback, 64);

	private _resizeObserver: ResizeObserver = new ResizeObserver(this._resizeCallbackDebunced);

	public get rendererKey() {
		return this.config.name;
	}

	public constructor() {
		super();
		this.camera.transformationStack.push(this._lookAt);
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
				1, // exposure factor
				1, // gamma
				256, // number of red colors, min 2^1, max 2^16
				256, // number of red colors, min 2^1, max 2^16
				256, // number of red colors, min 2^1, max 2^16
			],
			3 * 16,
		);
		this._kayo.gpux.gpuDevice.queue.writeBuffer(viewUBO, 0, this.viewBuffer);

		this.viewTimeBuffer.set([0, 0, this.canvas.width, this.canvas.height, frame, 0, 0, 0], 0);
		this._kayo.gpux.gpuDevice.queue.writeBuffer(viewUBO, this.viewBuffer.byteLength, this.viewTimeBuffer);
	}

	public getCurrentTexture(): GPUTexture {
		return this.canvasContext.getCurrentTexture();
	}

	private _timeRingCach = new Array(30).fill(
		{
			JavaScript: 0,
			Render: 0,
			indexResolve: 0,
			Selection: 0,
			Overlays: 0,
			compositingTime: 0,
		},
		0,
		30,
	);
	private _timeRingCurrentIndex = 0;
	public setGPUTime(times: any): void {
		this._timeRingCach[this._timeRingCurrentIndex] = times;
		this._timeRingCurrentIndex = (this._timeRingCurrentIndex + 1) % this._timeRingCach.length;
	}

	public get timeRingeCach() {
		return this._timeRingCach;
	}

	public get timeRingeCachCurrentIndex() {
		return this._timeRingCurrentIndex;
	}

	protected _wheelCallback = (e: WheelEvent) => {
		e.preventDefault();
		const val = e.deltaY / this.window.devicePixelRatio;
		this._lookAt.r += (this._lookAt.r * val) / 1024;
		this.project.requestAnimationFrameWith(this);
	};

	protected _rotateView = (dx: number, dy: number) => {
		this._lookAt.phi -= dx / 256;
		this._lookAt.theta -= dy / 256;
	};

	protected _shiftView = (dx: number, dy: number) => {
		const lat = vec3.latitudeTangent(this._lookAt.phi);
		const lon = vec3.longitudeTangent(this._lookAt.theta, this._lookAt.phi);
		this._lookAt.p = this._lookAt.p.add(
			lat.mulS((-dx / 256) * this._lookAt.r).add(lon.mulS((-dy / 256) * this._lookAt.r)),
		);
	};

	protected _keyMap: any = {};
	protected _touches: Touch[] = [];
	protected _documentKeyDownCallback = (e: KeyboardEvent) => (this._keyMap[e.key] = true);
	protected _documentKeyUpCallback = (e: KeyboardEvent) => delete this._keyMap[e.key];
	protected _touchStartCallback = (e: TouchEvent) => {
		for (const t of e.touches) this._touches[t.identifier] = t;
	};
	protected _touchMoveCallback = (e: TouchEvent) => {
		this.project.requestAnimationFrameWith(this);
		if (e.touches.length === 1) {
			const thisT = e.touches[0];
			const lastT = this._touches[thisT.identifier];
			this._rotateView(thisT.clientX - lastT.clientX, thisT.clientY - lastT.clientY);
			this._touches[thisT.identifier] = thisT;
		} else if (e.touches.length === 2) {
			const thisT1 = e.touches[0];
			const lastT1 = this._touches[thisT1.identifier];
			const thisT2 = e.touches[1];
			const lastT2 = this._touches[thisT2.identifier];
			const dx1 = thisT1.clientX - lastT1.clientX;
			const dy1 = thisT1.clientY - lastT1.clientY;
			const dx2 = thisT2.clientX - lastT2.clientX;
			const dy2 = thisT2.clientY - lastT2.clientY;
			const lastD = vec2.distance(lastT1.clientX, lastT1.clientY, lastT2.clientX, lastT2.clientY);
			const thisD = vec2.distance(thisT1.clientX, thisT1.clientY, thisT2.clientX, thisT2.clientY);
			const zoom = lastD / thisD;
			this._touches[thisT1.identifier] = thisT1;
			this._touches[thisT2.identifier] = thisT2;
			this._lookAt.r *= zoom;
			this._shiftView((dx1 + dx2) / 2, (dy1 + dy2) / 2);
		}
	};
	protected _touchEndCallback = (e: TouchEvent) => {
		for (const t of e.changedTouches) delete this._touches[t.identifier];
	};
	protected _keyListener = (e: KeyboardEvent) => {
		if (e.ctrlKey && e.shiftKey && e.key === " ") {
			this.requestFullscreen();
			this.project.fullRerender();
		}
	};
	protected _mouseEnterCallback = () => {
		this.window.addEventListener("keydown", this._keyListener);
	};
	protected _mouseLeaveCallback = () => {
		this.window.removeEventListener("keydown", this._keyListener);
	};
	protected connectedCallback() {
		this.project.registerViewport(this);
		this._resizeObserver.observe(this, {
			box: "device-pixel-content-box",
		});

		const orbitMove = (e: MouseEvent) => {
			if (e.shiftKey) this._shiftView(e.movementX, e.movementY);
			else this._rotateView(e.movementX, e.movementY);
			this.project.requestAnimationFrameWith(this);
		};

		const walkLook = (e: MouseEvent) => {
			const camPos1 = this.camera.getWorldLocation();
			const dphi = e.movementX / 256;
			const dtheta = e.movementY / 256;
			this._lookAt.phi -= dphi;
			this._lookAt.theta -= dtheta;
			const camPos2 = this.camera.getWorldLocation();
			this._lookAt.p = this._lookAt.p.add(camPos1.sub(camPos2));
			this.project.requestAnimationFrameWith(this);
		};

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
					if (this._keyMap["w"]) {
						this._lookAt.p = this._lookAt.p.sub(mat.getColumn(2).xyz.mulS(speed));
						this.project.requestAnimationFrameWith(this);
					}

					if (this._keyMap["s"]) {
						this._lookAt.p = this._lookAt.p.sub(mat.getColumn(2).xyz.mulS(-speed));
						this.project.requestAnimationFrameWith(this);
					}

					if (this._keyMap["a"]) {
						this._lookAt.p = this._lookAt.p.sub(mat.getColumn(0).xyz.mulS(speed));
						this.project.requestAnimationFrameWith(this);
					}

					if (this._keyMap["d"]) {
						this._lookAt.p = this._lookAt.p.sub(mat.getColumn(0).xyz.mulS(-speed));
						this.project.requestAnimationFrameWith(this);
					}
				};
				walkMove();
			}
		};

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

		this.window.document.body.addEventListener("keydown", this._documentKeyDownCallback);
		this.window.document.body.addEventListener("keyup", this._documentKeyUpCallback);
		this.addEventListener("wheel", this._wheelCallback, { passive: false });
		this.addEventListener("touchstart", this._touchStartCallback, { passive: false });
		this.addEventListener("touchmove", this._touchMoveCallback, { passive: false });
		this.addEventListener("touchend", this._touchEndCallback);
		this.addEventListener("mouseenter", this._mouseEnterCallback);
		this.addEventListener("mouseleave", this._mouseLeaveCallback);
	}

	protected disconnectedCallback() {
		this.project.unregisterViewport(this);
		this._resizeObserver.unobserve(this);

		this.window.document.body.removeEventListener("keydown", this._documentKeyDownCallback);
		this.window.document.body.removeEventListener("keyup", this._documentKeyUpCallback);
		this.removeEventListener("wheel", this._wheelCallback);
		this.removeEventListener("touchstart", this._touchStartCallback);
		this.removeEventListener("touchmove", this._touchMoveCallback);
		this.removeEventListener("touchend", this._touchEndCallback);
		this.removeEventListener("mouseenter", this._mouseEnterCallback);
		this.removeEventListener("mouseleave", this._mouseLeaveCallback);
	}

	public static createUIElement(win: Window, kayo: Kayo): ViewportPane {
		const p = win.document.createElement(this.getDomClass()) as ViewportPane;
		p._kayo = kayo;
		p.canvas = win.document.createElement("canvas");
		p.canvasContext = p.canvas.getContext("webgpu") as GPUCanvasContext;
		p.window = win;
		p.setAttribute("tabindex", "-1");
		p.focus();
		p.project = p._kayo.project;
		p.appendChild(p.canvas);
		p.config = kayo.wasmx.kayoInstance.project.renderConfigs.get("realtime default") as RenderConfig;
		return p;
	}

	public static getDomClass() {
		return "viewport-pane";
	}

	public static getName() {
		return "3D Viewport";
	}
}

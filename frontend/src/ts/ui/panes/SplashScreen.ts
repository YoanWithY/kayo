import { Kayo } from "../../Kayo";
import { uint8ArrayToObject } from "../../ressourceManagement/FileRessourceManager";

export class SplashScreen extends HTMLElement {
	private _win!: Window;
	private _container!: HTMLDivElement;
	private _propCancelCallback = (e: MouseEvent) => {
		e.stopPropagation();
	};
	private _removeSplashCallback = () => {
		this._win.document.body.removeChild(this);
	};

	protected connectedCallback() {
		this._container.addEventListener("pointerdown", this._propCancelCallback);
		this._win.document.body.addEventListener("pointerdown", this._removeSplashCallback);
	}

	protected disconnectedCallback() {
		this._container.removeEventListener("pointerdown", this._propCancelCallback);
		this._win.document.body.removeEventListener("pointerdown", this._removeSplashCallback);
	}

	public static async createUIElement(win: Window, kayo: Kayo) {
		const p = win.document.createElement(this.getDomClass()) as SplashScreen;

		const container = win.document.createElement("div");
		container.classList.add("splashScreenContainer");
		p.appendChild(container);

		const h1 = win.document.createElement("h1");
		h1.textContent = "Welcome to Kayo";
		container.append(h1);

		const h2_1 = win.document.createElement("h2");
		h2_1.textContent = "Open Project";
		container.append(h2_1);

		const wrapper1 = win.document.createElement("div");
		wrapper1.classList.add("splashEntryTable");

		for (const projektDirHandle of kayo.fileRessourceManager.serializedProjects) {
			const project = uint8ArrayToObject(
				new Uint8Array(
					await (await (await projektDirHandle.getFileHandle("project.json")).getFile()).arrayBuffer(),
				),
			);
			const meta = uint8ArrayToObject(
				new Uint8Array(
					await (await (await projektDirHandle.getFileHandle("meta.json")).getFile()).arrayBuffer(),
				),
			);
			const nameSpan = win.document.createElement("span");
			nameSpan.textContent = project.name;
			wrapper1.appendChild(nameSpan);

			const dateSpan = win.document.createElement("span");
			dateSpan.textContent = meta.created;
			wrapper1.appendChild(dateSpan);
		}
		container.append(wrapper1);

		const h2_2 = win.document.createElement("h2");
		h2_2.textContent = "Unsaved Projects";
		container.append(h2_2);

		const wrapper2 = win.document.createElement("div");

		const timedEntries: { time: string; dir: FileSystemDirectoryHandle }[] = [];
		for (const projektDirHandle of kayo.fileRessourceManager.unserializedProjects) {
			if (projektDirHandle.name === kayo.fileRessourceManager.projectRootName) continue;

			let meta = { created: "1900-01-01T" };
			try {
				meta = uint8ArrayToObject(
					new Uint8Array(
						await (await (await projektDirHandle.getFileHandle("meta.json")).getFile()).arrayBuffer(),
					),
				);
			} catch (e) {
				console.error(e);
			}

			timedEntries.push({ time: meta.created, dir: projektDirHandle });
		}

		const keep = 3;
		const timeSorted = timedEntries
			.toSorted((a, b) => a.time.localeCompare(b.time, undefined, { sensitivity: "base" }))
			.reverse();
		const delArray = timeSorted.slice(Math.min(timedEntries.length, keep));
		kayo.fileRessourceManager.deleteUnserializedProjects(delArray.map((a) => a.dir));

		for (const { time, dir } of timeSorted.slice(0, Math.min(timeSorted.length, keep))) {
			if (dir.name === kayo.fileRessourceManager.projectRootName) continue;
			const rowWrapper = win.document.createElement("div");
			rowWrapper.classList.add("splashRow");

			const nameSpan = win.document.createElement("span");
			nameSpan.textContent = "Unnamed Project";
			rowWrapper.appendChild(nameSpan);

			const dateSpan = win.document.createElement("span");
			dateSpan.textContent = time;
			rowWrapper.appendChild(dateSpan);
			wrapper2.appendChild(rowWrapper);
		}

		container.append(wrapper2);

		p._win = win;
		p._container = container;
		return p;
	}

	public static getDomClass(): string {
		return "splash-screen";
	}
}

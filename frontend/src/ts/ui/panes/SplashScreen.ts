import { Kayo } from "../../Kayo";
import { uint8ArrayToObject } from "../../ressourceManagement/FileRessourceManager";

export class SplashScreen extends HTMLElement {
	private _win!: Window;
	private _propCancelCallback = (e: MouseEvent) => {
		e.stopPropagation();
	};
	private _removeSplashCallback = () => {
		this._win.document.body.removeChild(this);
	};

	protected connectedCallback() {
		this.addEventListener("pointerdown", this._propCancelCallback);
		this._win.document.body.addEventListener("pointerdown", this._removeSplashCallback);
	}

	protected disconnectedCallback() {
		this.removeEventListener("pointerdown", this._propCancelCallback);
		this._win.document.body.removeEventListener("pointerdown", this._removeSplashCallback);
	}

	public static async createUIElement(win: Window, kayo: Kayo) {
		const p = win.document.createElement(this.getDomClass()) as SplashScreen;

		const h1 = win.document.createElement("h1");
		h1.textContent = "Welcome to Kayo";
		p.append(h1);

		const h2_1 = win.document.createElement("h2");
		h2_1.textContent = "Open Project";
		p.append(h2_1);

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
		p.append(wrapper1);

		const h2_2 = win.document.createElement("h2");
		h2_2.textContent = "Unsaved Projects";
		p.append(h2_2);

		const deleteButton = win.document.createElement("button");
		deleteButton.textContent = "delete all";
		p.append(deleteButton);

		const wrapper2 = win.document.createElement("div");
		wrapper2.classList.add("splashEntryTable");

		for (const projektDirHandle of kayo.fileRessourceManager.unserializedProjects) {
			if (projektDirHandle.name === kayo.fileRessourceManager.projectRootName) continue;
			const rowWrapper = win.document.createElement("div");
			rowWrapper.classList.add("splashRow");

			const nameSpan = win.document.createElement("span");
			nameSpan.textContent = "Unnamed Project";
			rowWrapper.appendChild(nameSpan);

			let meta = { created: "unknown" };
			try {
				meta = uint8ArrayToObject(
					new Uint8Array(
						await (await (await projektDirHandle.getFileHandle("meta.json")).getFile()).arrayBuffer(),
					),
				);
			} catch (e) {
				console.error(e);
			}

			const dateSpan = win.document.createElement("span");
			dateSpan.textContent = meta.created;
			rowWrapper.appendChild(dateSpan);
			wrapper2.appendChild(rowWrapper);
		}
		p.append(wrapper2);

		const deleteUnsavedCallback = (_: MouseEvent) => {
			kayo.fileRessourceManager.deleteUnserializedProjects();
			wrapper2.innerHTML = "";
		};
		deleteButton.addEventListener("click", deleteUnsavedCallback);

		p._win = win;
		return p;
	}

	public static getDomClass(): string {
		return "splash-screen";
	}
}

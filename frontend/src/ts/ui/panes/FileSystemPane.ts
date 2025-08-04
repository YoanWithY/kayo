import { Kayo } from "../../Kayo";
import { DirectoryEntry, QueryFileSystemTask } from "../../ressourceManagement/jsTasks/QuereyFileSystemTask";
import BasicPane from "./BasicPane";
import ressourcePaneTemplate from "./FileSystemPane.json";

export class FileSystemPane extends BasicPane {
	private _ul!: HTMLUListElement;
	private _win!: Window;

	protected connectedCallback() {
		this._build();
	}

	protected disconnectedCallback() {}

	private _appendDirectory(ul: HTMLUListElement, dir: DirectoryEntry) {
		for (const child of dir.children) {
			const li = this._win.document.createElement("li");
			li.textContent = child.name;
			if (child.kind !== "file") {
				const newUl = this._win.document.createElement("ul");
				this._appendDirectory(newUl, child);
				li.appendChild(newUl);
			}
			ul.appendChild(li);
		}
	}

	private _build() {
		const queryCallback = (fs: DirectoryEntry | undefined) => {
			this._ul.innerHTML = "";
			if (!fs) {
				console.error("File system querey failed!");
				return;
			}
			this._appendDirectory(this._ul, fs);
		};
		this._kayo.taskQueue.queueTask(new QueryFileSystemTask("", -1, queryCallback));
	}

	public static createUIElement(win: Window, kayo: Kayo): FileSystemPane {
		const p = super.createUIElement(win, kayo, ressourcePaneTemplate) as FileSystemPane;
		p._win = win;
		p._ul = win.document.createElement("ul");
		p.appendChild(p._ul);
		return p;
	}

	public static getDomClass(): string {
		return "file-system-pane";
	}

	public static getName() {
		return "File System";
	}
}

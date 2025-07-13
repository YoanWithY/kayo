import { Kayo } from "../../Kayo";
import BasicPane from "./BasicPane";
import ressourcePaneTemplate from "./FileSystemPane.json";

export class FileSystemPane extends BasicPane {
	private _ul!: HTMLElement;
	private _win!: Window;

	private async _dirToUl(fs: FileSystemDirectoryHandle) {
		const ul = this._win.document.createElement("ul");
		for await (const e of fs.entries()) {
			const fsh = e[1];
			const li = this._win.document.createElement("li");
			li.textContent = fsh.name;
			if (fsh.kind == "directory") li.appendChild(await this._dirToUl(fsh as FileSystemDirectoryHandle));
			ul.appendChild(li);
		}
		return ul;
	}

	private _buildCallback = async () => {
		this.replaceChild(await this._dirToUl(this.kayo.fileRessourceManager.systemRoot), this._ul);
	};

	protected connectedCallback() {
		this._buildCallback();
	}

	protected disconnectedCallback() {}

	public static createUIElement(win: Window, kayo: Kayo): FileSystemPane {
		const p = super.createUIElement(win, kayo, ressourcePaneTemplate) as FileSystemPane;
		p._win = win;
		p._ul = win.document.createElement("div");
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

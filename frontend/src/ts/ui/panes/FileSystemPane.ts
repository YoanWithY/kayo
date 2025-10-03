import { EditorState } from "@codemirror/state";
import { Kayo } from "../../Kayo";
import { LoadFileTask } from "../../ressourceManagement/jsTasks/LoadFileTask";
import { DirectoryEntry, QueryFileSystemTask } from "../../ressourceManagement/jsTasks/QuereyFileSystemTask";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

export class FileSystemPane extends HTMLElement {
	private _kayo!: Kayo;
	private _ul!: HTMLUListElement;
	private _win!: Window;
	private _textPreview?: EditorView;

	protected connectedCallback() {
		this._build();
	}

	protected disconnectedCallback() {
		if (this._textPreview) {
			this._textPreview.destroy();
		}
	}

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
		this._kayo.taskQueue.queueFSTask(new QueryFileSystemTask("", -1, queryCallback));

		const loadCallback = (data: Uint8Array | undefined) => {
			if (!data) return;

			const myStyle = HighlightStyle.define([
				{ tag: tags.string, color: "rgb(206, 145, 120)" },
				{ tag: tags.number, color: "#098658" },
				{ tag: tags.bool, color: "#008080" },
				{ tag: tags.null, color: "#808080" },
				{ tag: tags.keyword, color: "#0000ff" },
			]);

			const myTheme = EditorView.theme(
				{
					"&": {
						color: "white",
						backgroundColor: "rgba(0, 0, 0, 0.25)",
						"border-radius": "var(--radius)",
						outline: "none",
						border: "none",
					},
					".cm-content": {},
					"&.cm-focused .cm-cursor": {
						"border-left": "2px solid",
						borderLeftColor: "rgba(200, 200, 200)",
					},
					"&.cm-focused .cm-selectionBackground, ::selection": {
						backgroundColor: "rgba(9, 57, 96, 1) !important",
					},
					".cm-gutters": {
						backgroundColor: "transparent",
						color: "rgba(255, 255, 255, 0.5)",
					},
				},
				{ dark: true },
			);

			const jsonText = new TextDecoder().decode(data);
			const state = EditorState.create({
				doc: jsonText,
				extensions: [
					// lineNumbers(),
					// drawSelection(),
					// highlightActiveLineGutter(),
					json(),
					myTheme,
					syntaxHighlighting(myStyle),
					EditorState.readOnly.of(true),
					EditorView.editable.of(false),
				],
			});

			this._textPreview = new EditorView({
				state,
				parent: this,
			});
		};
		this._kayo.taskQueue.queueFSTask(new LoadFileTask("./", "project.json", loadCallback));
	}

	public static createUIElement(win: Window, kayo: Kayo): FileSystemPane {
		const p = win.document.createElement(this.getDomClass()) as FileSystemPane;
		p._kayo = kayo;
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

import { initUI as initUIClasses } from "./ui/ui";
import { Kayo } from "./Kayo";
import initWasmx from "./ressourceManagement/KayoWasmLoader";
import { ViewportPane } from "./ui/panes/ViewportPane";
import { GPUX } from "./GPUX";
import { StoreFileTask as StoreFileTask } from "./ressourceManagement/jsTasks/StoreFileTask";
import { SplashScreen } from "./ui/panes/SplashScreen";
import TextureUtils from "./Textures/TextureUtils";
import { ConcurrentTaskQueue } from "./ressourceManagement/ConcurrentTaskQueue";
import { DirectoryEntry, FSEntry, QueryFileSystemTask } from "./ressourceManagement/jsTasks/QuereyFileSystemTask";
import { LoadFileTask, LoadFileTaskFinishedCallback } from "./ressourceManagement/jsTasks/LoadFileTask";
import { uint8ArrayToObject } from "./Utils";
import { DeleteFSEntryFinishedCallback, DeleteFSEntryTask } from "./ressourceManagement/jsTasks/DeleteFSEntryTask";

function randomString(length: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const loadPara = window.document.getElementById("loadingParagraph") as HTMLParagraphElement;
loadPara.textContent = "Initi UI...";
initUIClasses();

window.name = "Kayo Main";
loadPara.textContent = "Init WebGPU";
const gpux = await GPUX.requestGPUX();
if (typeof gpux === "string") {
	alert(`Could not initialize WebGPU with reason: ${gpux}`);
	throw new Error("Could not initialize WebGPU!", { cause: gpux });
}
TextureUtils.init(gpux);

loadPara.textContent = "Init WASM...";
const wasmx = await initWasmx();

const newRootName = randomString(16);

loadPara.textContent = "Init Workers...";
const taskQueue = new ConcurrentTaskQueue();
await taskQueue.initWorkers(newRootName);

const kayo = new Kayo(gpux, wasmx, taskQueue, newRootName);

loadPara.textContent = "Init Filesystem...";

function removeLoadingScreen() {
	window.document.body.appendChild(SplashScreen.createUIElement(window, kayo));
	window.document.body.removeChild(window.document.getElementById("kayoLoading") as HTMLDivElement);
}

const fileSystemQuereyCallback = (dir: DirectoryEntry | undefined) => {
	if (!dir) {
		console.error("Could not get file system entries!");
		return;
	}

	const unserializedProjects = dir.children.filter((projectEntry: FSEntry) => {
		if (projectEntry.kind === "file") return false;
		return projectEntry.children.find((e) => e.name == "project.kp") === undefined;
	}) as DirectoryEntry[];

	const timedProjects: { project: DirectoryEntry; time: string }[] = [];
	for (const project of unserializedProjects) {
		const getMetaCallback: LoadFileTaskFinishedCallback = (data) => {
			const entry = { project: project, time: "1900-00-00T00:00:00.000Z" };
			if (data !== undefined) {
				const metaData = uint8ArrayToObject(data);
				if (metaData !== undefined) {
					entry.time = metaData.created;
				}
			}
			timedProjects.push(entry);

			if (timedProjects.length !== unserializedProjects.length) return;

			timedProjects.sort((a, b) => a.time.localeCompare(b.time, undefined, { sensitivity: "base" })).reverse();
			const delArray = timedProjects.slice(Math.min(timedProjects.length, 3));
			if (delArray.length === 0) removeLoadingScreen();

			let finishCount = 0;
			for (const p of delArray) {
				const deleteCallback: DeleteFSEntryFinishedCallback = () => {
					finishCount++;
					if (finishCount === delArray.length) removeLoadingScreen();
				};
				taskQueue.queueTask(new DeleteFSEntryTask("", p.project.name, deleteCallback));
			}
		};
		taskQueue.queueTask(new LoadFileTask(project.name, "meta.json", getMetaCallback));
	}
};

const storeMetaCallback = (success: true | undefined) => {
	if (!success) {
		console.error("Could not write meta file.");
		return;
	}
	taskQueue.queueTask(new QueryFileSystemTask("", 1, fileSystemQuereyCallback));
};

taskQueue.queueTask(
	new StoreFileTask(
		newRootName,
		"meta.json",
		new TextEncoder().encode(JSON.stringify({ created: new Date().toISOString() })),
		storeMetaCallback,
	),
);

(window as any).kayo = kayo;

window.addEventListener("beforeunload", (_) => {
	if (kayo.windows.size > 1) kayo.closeAllSecondaryWindows(window);
});

kayo.registerWindow(window, ViewportPane.getName(), true);

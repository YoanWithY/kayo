addToLibrary({
	kayoDispatchToObserver: function kayoDispatchToObserver(id) {
		const kayo = window.kayo;
		window.kayo.wasmx.vcDispatch(id);
		kayo.project.fullRerender();
	},
	kayoTaskUpdate: function kayoTaskUpdate(id, progress, maximum) {
		window.kayo.wasmx.taskQueue.taskUpdate(id, progress, maximum);
	},
	kayoTaskFinished: function kayoTaskFinished(id, returnValue) {
		window.kayo.wasmx.taskQueue.taskFinished(id, returnValue);
	},
});

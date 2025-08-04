addToLibrary({
	kayoDispatchToObserver: function kayoDispatchToObserver(id) {
		const kayo = window.kayo;
		window.kayo.wasmx.vcDispatch(id);
		kayo.project.fullRerender();
	},
});

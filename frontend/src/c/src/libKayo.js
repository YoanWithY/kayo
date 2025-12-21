addToLibrary({
	kayoDispatchUint32ToObserver: function kayoDispatchUint32ToObserver(pub_id, value) {
		window.kayo.project.dispatchValueToSubscribers(pub_id, value);
	},
	kayoDispatchFixedPointToObserver: function kayoDispatchFixedPointToObserver(pub_id, ptr) {
		const kayo = window.kayo;
		kayo.project.dispatchValueToSubscribers(pub_id, kayo.wasmx.wasm.readFixedPointFromHeap(ptr));
	},
	kayoDispatchStringToObserver: function kayoDispatchStringToObserver(pub_id, value) {
		window.kayo.project.dispatchValueToSubscribers(pub_id, UTF8ToString(value));
	},
	kayoDispatchBooleanToObserver: function kayoDispatchBooleanToObserver(pub_id, value) {
		window.kayo.project.dispatchValueToSubscribers(pub_id, value);
	},
});

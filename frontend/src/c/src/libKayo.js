addToLibrary({
	kayoDispatchUint32ToObserver: function kayoDispatchUint32ToObserver(ptr, value) {
		window.kayo.wasmx.dispatchUint32ToObserver(ptr, value);
	},
	kayoDispatchFixedPointToObserver: function kayoDispatchFixedPointToObserver(ptr) {
		window.kayo.wasmx.dispatchFixedPointToObserver(ptr);
	},
	kayoDispatchStringToObserver: function kayoDispatchStringToObserver(ptr, value) {
		window.kayo.wasmx.dispatchStringToObserver(ptr, UTF8ToString(value));
	},
	kayoDispatchBooleanToObserver: function kayoDispatchBooleanToObserver(ptr, value) {
		window.kayo.wasmx.dispatchBooleanToObserver(ptr, value);
	},
});

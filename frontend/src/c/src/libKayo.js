addToLibrary({
	kayoDispatchUint32ToObserver: function kayoDispatchUint32ToObserver(ptr, value) {
		const kayo = window.kayo.wasmx.dispatchUint32ToObserver(ptr, value);
	},
	kayoDispatchFixedPointToObserver: function kayoDispatchFixedPointToObserver(ptr) {
		const kayo = window.kayo.wasmx.dispatchFixedPointToObserver(ptr);
	},
	kayoDispatchStringToObserver: function kayoDispatchStringToObserver(ptr, value) {
		const kayo = window.kayo.wasmx.dispatchStringToObserver(ptr, UTF8ToString(value));
	},
	kayoDispatchBooleanToObserver: function kayoDispatchBooleanToObserver(ptr, value) {
		const kayo = window.kayo.wasmx.dispatchBooleanToObserver(ptr, value);
	},
});

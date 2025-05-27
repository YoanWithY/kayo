addToLibrary({
    kayoDispatchToObserver:
        function kayoDispatchToObserver(id) {
            const kayo = window.kayo;
            kayo.wasmx.vcDispatch(id);
            kayo.project.fullRerender();
        },
});


addToLibrary({
    kayoDispatchToObserver:
        function kayoDispatchToObserver(id, value) {
            window.pageContext.project.observationHandler.dispatch(id, value);
        },
});


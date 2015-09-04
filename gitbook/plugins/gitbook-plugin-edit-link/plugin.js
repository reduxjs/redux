require(["gitbook"], function(gitbook) {
    gitbook.events.bind("page.change", function() {
        // move the edit link to the header, after font-setting icon
        $(document.getElementById("edit-link")).insertAfter("#font-settings-wrapper");
    });
});
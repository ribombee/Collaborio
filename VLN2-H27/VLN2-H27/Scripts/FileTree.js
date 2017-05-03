$(document).ready(function () {
    $('.filetree').fileTree({
        root: '/FileTree/sample',
        script: '/jQueryFileTree/dist/connectors/jqueryFileTree.asp',
        expandSpeed: 1000,
        collapseSpeed: 1000,
        multiFolder: false
    }, function (file) {
        alert(file);
    });
});
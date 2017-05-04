//MONACO EDITOR SPECIFIC CODE
var editor = null;

$(document).ready(function () {
    require.config({ paths: { 'vs': '../../Monaco/dev/vs' } });
    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('monaco-editor'),{
                value: [
                    'function x() {',
                    '\tconsole.log("Hello world!");',
                    '}'
                ].join('\n'),
                //Hardcoded for now
                language: 'javascript'
            });

        //Language modes
        var MODES = (function () {
            var modesIds = monaco.languages.getLanguages().map(function (lang) { return lang.id; });
            modesIds.sort();

            return modesIds.map(function (modeId) {
                return {
                    modeId: modeId,
                    sampleURL: 'index/samples/sample.' + modeId + '.txt'
                };
            });
        })();

        //Populate language list
        var startModeIndex = 0;
        for (var i = 0; i < MODES.length; i++) {
            var o = document.createElement('option');
            //like everywhere, default language is hardcoded
            if (MODES[i].modeId === 'javascript') {
                startModeIndex = i;
            }
            o.textContent = MODES[i].modeId;
            $(".language-picker").append(o);
        }

        //Hardcoded for now, will need to be fetched later
        $(".language-picker")[0].selectedIndex = startModeIndex;

        $(".language-picker").change(function () {
            changeLanguage(MODES[this.selectedIndex], editor);
        });


        $(".theme-picker").change(function () {
            changeTheme(this.selectedIndex, editor);
        });
    });
});

function changeTheme(theme) {
    var newTheme = (theme === 1 ? 'vs-dark' : (theme === 0 ? 'vs' : 'hc-black'));
    editor.updateOptions({ 'theme': newTheme });
}

function changeLanguage(mode) {
    var oldModel = editor.getModel();
    var newModel = monaco.editor.createModel(oldModel.getValue(), mode.modeId);

    editor.setModel(newModel);

    oldModel.dispose();
}


//JQUERYFILETREE SPECIFIC CODE
$(document).ready(function () {
    $('.filetree').fileTree({
        root: '/FileTree/sample/',
        script: '/jQueryFileTree/dist/connectors/jqueryFileTree.asp',
        expandSpeed: 1000,
        collapseSpeed: 1000,
        multiFolder: false
    }, function (file) {
        openFileInMonaco(file);
    });

});

//right click handling
var rightClickedFile = "";

var contextMenuSettings = {
    title: 'Empty',
    items: [
      { label: 'Some Item', icon: 'icons/shopping-basket.png', action: function () { alert('clicked 1') } },
      { label: 'Another Thing', icon: 'icons/receipt-text.png', action: function () { alert('clicked 2') } },
      null, /* null can be used to add a separator to the menu items */
      { label: 'Blah Blah', icon: 'icons/book-open-list.png', action: function () { alert('clicked 3') }, isEnabled: function () { return false; } },
    ]
}


$('.filetree').mousedown(function (event) {
    switch (event.which) {
        case 2:
            //middle mouse
            break;
        case 3:
            rightClickedFile = $('a:hover').attr('rel');
            if (typeof rightClickedFile == 'undefined') {
                rightClickedFile = "nofile";
            }
            break;
    }
});

$('.filetree').contextPopup({
    title: '',
    items: [
      { label: 'Delete', icon: '', action: function () { deleteFile(rightClickedFile) } },
      { label: 'Rename', icon: '', action: function () { renameFile(rightClickedFile) } },
      { label: 'Blah Blah', icon: 'icons/book-open-list.png', action: function () { alert('clicked 3') }, isEnabled: function () { return false; } },
    ]
});

//MISC HELPER FUNCTIONS
function readFile(file) {
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', file, false);
    xmlhttp.send();

    return xmlhttp.responseText;
}

function openFileInMonaco(file) {
    //TODO: Fetch file mode automagicalliy
    var mode = 'javascript';

    var oldModel = editor.getModel();
    var newModel = monaco.editor.createModel(readFile(file), mode);

    editor.setModel(newModel);

    oldModel.dispose();
}

function deleteFile(file) {
    //TODO IMPLEMENT
    alert(file + ' would be deleted now');
}

function renameFile(file) {
    //TODO IMPLEMENT
    alert(file + ' would be renamed now');
}
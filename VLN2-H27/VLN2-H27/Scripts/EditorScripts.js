//MONACO EDITOR SPECIFIC CODE
var editor = null;

$(document).ready(function () {
    require.config({ paths: { 'vs': '../../EditorLibraries/Monaco/dev/vs' } });
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
    //TODO UPDATE TAB MODEL
    oldModel.dispose();
}

//JQUERYFILETREE SPECIFIC CODE
function initFileTree() {
    $('.filetree').fileTree({
        root: '/FileTree/sample/',
        script: '/EditorLibraries/jQueryFileTree/dist/connectors/jqueryFileTree.asp',
        folderEvent: 'dblclick',
        expandSpeed: 1,
        collapseSpeed: 1,
        multiFolder: true
    }, function (file) {
        openFileInMonaco(file);
    });
}

$(document).ready(function () {
    initFileTree();
    initFileTreeContextMenu();
});

//right click handling
var rightClickedFile = '';

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

function initFileTreeContextMenu() {
    $('.filetree').contextPopup({
        title: '',
        items: [
          { label: 'Delete', icon: '', action: function () { deleteFile(rightClickedFile) } },
          { label: 'Rename', icon: '', action: function () { renameFile(rightClickedFile) } },
          { label: 'Refresh', icon: '', action: function () { refreshFileTree() } }
        ]
    });
}

function refreshFileTree() {
    //scan for expanded folders
    var expandedFolders = [];
    $('li.directory.expanded').each(function (index) {
        console.log("expanded dir");
        var expandedFolder = $(this).find('a').attr('rel');
        console.log(expandedFolder);
        expandedFolders.push(expandedFolder);
    });

    //reload the tree
    var tree = $('.filetree').data('fileTree');
    $('.filetree').empty();
    tree.showTree($('.filetree'), escape(tree.options.root), function () {});

    //re-expand the folders
    setTimeout(function () {
        for (i = 0; i < expandedFolders.length; i++) {
            var folderElement = $("a[rel='" + expandedFolders[i] + "']");
            folderElement.trigger('dblclick');
        }
    }, 500);
}


//TABS SPECIFIC CODE
var tabInfo = [];
var tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>",
      tabCounter = 0;
var tabs = $("#tabs").tabs();
$(document).ready(function() {
    var tabTitle = $("#tab_title"),
      tabContent = $("#tab_content");

    // Close icon: removing the tab on click
    tabs.on("click", "span.ui-icon-close", function () {
        var panelId = $(this).closest("li").remove().attr("aria-controls");
        $("#" + panelId).remove();
        tabRemovalCleanup(panelId);
        tabs.tabs("refresh");
    });

    tabs.on("keyup", function (event) {
        if (event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE) {
            var panelId = tabs.find(".ui-tabs-active").remove().attr("aria-controls");
            $("#" + panelId).remove();
            tabs.tabs("refresh");
        }
    });
});

function addTab(title, file, newModel) {
    var label = title,
      id = "tabs-" + tabCounter,
      li = $(tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g, label)),
      tabContentHtml = file;

    tabs.find(".ui-tabs-nav").append(li);
    tabs.append("<div id='" + id + "' class='tabcontent'><p>" + tabContentHtml + "</p></div>");
    tabs.tabs("refresh");
    tabCounter++;

    tabInfo.push({
        tabId: id,  tabModel: newModel, filePath: file
    });
    
    //set tab to active
    $('#tabs').tabs({ active: tabIdToIndex(id) });
}

//Selecting a tab
$('#tabs').tabs({
    activate: function (event, ui) {
        var tabId = ui.newPanel[0].id
        openTabInMonaco(tabId);
    }
});

function openTabInMonaco(tabId) {
    //TODO: Fetch file mode automagicalliy
    var mode = 'javascript';

    var newModel = getEditorModelOfTab(tabId);
    editor.setModel(newModel);
}

function getEditorModelOfTab(tabId) {
    for (i = 0; i < tabInfo.length; i++) {
        if (tabInfo[i].tabId == tabId) {
            return tabInfo[i].tabModel;
        }
    }
}

function fileAlreadyOpenInTab(file) {
    for (i = 0; i < tabInfo.length; i++) {
        if (tabInfo[i].filePath == file) {
            return tabInfo[i].tabId;
        }
    }

    return null;
}

function tabIdToIndex(tabId) {
    var tabIndex = $('#tabs a[href="#' + tabId + '"]').parent().index();
    return tabIndex;
}

function tabRemovalCleanup(tabId) {
    //find editor model and remove from tabInfo
    var oldModel;
    for (i = 0; i < tabInfo.length; i++) {
        if (tabInfo[i].tabId == tabId) {
            oldModel = tabInfo[i].tabModel;
            tabInfo.splice(i, 1);
        }
    }

    //dispose of editor model
    oldModel.dispose();
}

//MISC HELPER FUNCTIONS
function readFile(file) {
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', file, false);
    xmlhttp.send();

    return xmlhttp.responseText;
}

function openFileInMonaco(file) {
    //is the file already open in a tab?
    var tabId = fileAlreadyOpenInTab(file);
    if (tabId != null) {
        var tabIndex = tabIdToIndex(tabId);
        $('#tabs').tabs({ active: tabIndex });
        return;
    }

    //TODO: Fetch file mode automagicalliy
    var mode = 'javascript';

    var newModel = monaco.editor.createModel(readFile(file), mode);
    editor.setModel(newModel);

    var filename = file.replace(/^.*[\\\/]/, '')
    addTab(filename, file, newModel);
}

function deleteFile(file) {
    //TODO IMPLEMENT
    //remember to update tabInfo array

    alert(file + ' would be deleted now');
}

function renameFile(file) {
    //TODO IMPLEMENT
    //remember to update tabInfo array

    alert(file + ' would be renamed now');
}
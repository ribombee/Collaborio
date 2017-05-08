/*****************************************************
MONACO EDITOR SPECIFIC CODE
START
******************************************************/
//Editor variable, access editor with this
var editor = null;
//Filename of file currently being edited
var currentlyEditingFile = "";
//available languages in monaco
var availableLanguages = [];

//Initialize Monaco editor when document is ready
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

        //Get available programming languages
        availableLanguages = monaco.languages.getLanguages().map(function(language) { return language.id });
        availableLanguages.sort();

        //Populate language list
        for (var i = 0; i < availableLanguages.length; i++) {
            var o = document.createElement('option');
            o.textContent = availableLanguages[i];
            $(".language-picker").append(o);
        }

        $(".language-picker").change(function () {
            monaco.editor.setModelLanguage(editor.getModel(), availableLanguages[this.selectedIndex]);
        });


        $(".theme-picker").change(function () {
            changeTheme(this.selectedIndex);
        });
        
    });
});

//Change monaco editor theme
function changeTheme(theme) {
    var newTheme = (theme === 1 ? 'vs-dark' : (theme === 0 ? 'vs' : 'hc-black'));
    editor.updateOptions({ 'theme': newTheme });
}

//returns the name of the language that corresponds to the file extension
function getLanguage(file)
{
    var fileEnding = '.' + file.split('.').pop();
    var languages = monaco.languages.getLanguages();
    for(var i = 0; i < languages.length; i++){
        for(var j = 0; j < languages[i].extensions.length; j++){
            if (languages[i].extensions[j] == fileEnding){
                return languages[i].id;
            }
        }
    }
    //if its is not a supported filetype we default to plaintext (no highlighting)
    return 'plaintext';
}

//Open file in monaco, adds tab
var currentlyOpeningFile = '';
function openFileInMonaco(file) {
    //is the file already open in a tab?
    var tabFound = fileAlreadyOpenInTab(file),
        tabId = null;
    if (tabFound != null) {
        tabId = tabFound.tabId;
    }
    if (tabId != null) {
        var tabIndex = tabIdToIndex(tabId);
        $('#tabs').tabs({ active: tabIndex });
        return;
    }

    currentlyOpeningFile = file;
    //Request file from server, so if no other client is working on the file it opens from server.
    requestFileFromServer(file);
    //also request the file from other clients, if request from server finishes first, it overwrites it. server file will not overwrite client file
    hubProxy.server.requestFile(file);
    console.log("requesting file: " + file);
}

//Request file from server
function requestFileFromServer(file) {
    var sendData = {
        'filePath': file,
    };

    $.ajax({
        type: "POST",
        url: 'getFileValue',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(sendData),
        dataType: "json",
        success: function (data) {;
            openDataInMonaco(data, file, false);
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
        }
    });
}

//Open data in monaco
function openDataInMonaco(data, file, signalR) {
    if (!signalR) {
        if (fileAlreadyOpenInTab(file) != null) {
            //file is already open in a tab, no need to get the server's outdated version
            return;
        }
    }

    //changes the language so that the syntax highlighting is correct
    var language = getLanguage(file);
    setLanguagePicker(language);

    var newModel = monaco.editor.createModel(data, language);
    editor.setModel(newModel);
    var filename = currentlyOpeningFile.replace(/^.*[\\\/]/, '')

    addTab(filename, currentlyOpeningFile, newModel);
}

//create new monaco edit operation from this info.
function createNewEditOperation(filePath, startColumn, endColumn, startLineNumber, endLineNumber, textValue) {
    var line = editor.getPosition();
    var range = new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
    var id = { major: 1, minor: 1 };
    var text = textValue;
    var op = [{ identifier: id, range: range, text: text, forceMoveMarkers: false }];

    return op;
}

//Set language picker dropdown
function setLanguagePicker(language) {
    $(".language-picker")[0].selectedIndex = availableLanguages.indexOf(language);
}
/*****************************************************
MONACO EDITOR SPECIFIC CODE
END
******************************************************/

/*****************************************************
JQUERYFILETREE & CONTEXTMENU SPECIFIC CODE
START
******************************************************/

//jQueryFileTree initialization function - this is called when SignalR connects to the hub
var fileTreeHtml = "";
function initFileTree() {
    $('.filetree').fileTree({
        root: '/UserProjects/' + projectId + '/',
        script: '/EditorLibraries/jQueryFileTree/dist/connectors/jqueryFileTree.asp',
        folderEvent: 'dblclick',
        expandSpeed: 1,
        collapseSpeed: 1,
        multiFolder: true
    }, function (file) {
        openFileInMonaco(file);
    });
    fileTreeHtml = $('#filetree-parent')
}

//Right click handling
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

//Initialize file tree context menu function - this is called when signalR connects to the hub
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

//Hide file tree
function hideFileTree() {
    //TODO make this work
    var fileTreeHtml = $('#filetree-parent').html();
    $('#filetree').html('');
}


//Refresh File Tree
function refreshFileTree() {
    //scan for expanded folders
    var expandedFolders = [];
    $('li.directory.expanded').each(function (index) {
        var expandedFolder = $(this).find('a').attr('rel');
        expandedFolders.push(expandedFolder);
    });

    //reload the tree
    var tree = $('.filetree').data('fileTree');
    $('.filetree').empty();
    tree.showTree($('.filetree'), escape(tree.options.root), function () {});

    //re-expand the folders
    //has to be called again to reexpand subfolders TODO
    setTimeout(function () {
        for (i = 0; i < expandedFolders.length; i++) {
            var folderElement = $("a[rel='" + expandedFolders[i] + "']");
            folderElement.trigger('dblclick');
        }
    }, 500);
}
/*****************************************************
JQUERYFILETREE & CONTEXTMENU SPECIFIC CODE
END
******************************************************/


/*****************************************************
TABS SPECIFIC CODE
START
******************************************************/
//declare global tab variables
var tabInfo = [];
var tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>",
      tabCounter = 0;
var tabs = $("#tabs").tabs();

//Initialize tab events when document is ready
$(document).ready(function() {
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
    
    //make tabs sortable
    tabs.find(".ui-tabs-nav").sortable({
        axis: "x",
        stop: function () {
            tabs.tabs("refresh");
        }
    });

    //make tabs drag-n-droppable
    $('#tabs').droppable({
        activeClass: "ui-state-highlight",
        drop: function (event, ui) {
            $("#tabs ul").append("<li>" + ui.draggable.html() + "</li>");
            tabs.tabs("refresh");
            $(ui.draggable).remove()
            var tabId = ui.draggable.attr('id');
            $('#tabs').tabs({ active: tabIdToIndex(tabId)});
        }
    });
});

//Add new tab
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
        currentlyEditingFile = getFileFromTabId(tabId);
        console.log('Currently editing ' + currentlyEditingFile);
    }
});

//Open tab in monaco
function openTabInMonaco(tabId) {
    var newModel = getEditorModelOfTab(tabId);
    editor.setModel(newModel);
    setLanguagePicker(newModel.getModeId());
}

//Get monaco model of tab
function getEditorModelOfTab(tabId) {
    for (i = 0; i < tabInfo.length; i++) {
        if (tabInfo[i].tabId == tabId) {
            return tabInfo[i].tabModel;
        }
    }
}

//Get file from tabId
function getFileFromTabId(tabId) {
    for (i = 0; i < tabInfo.length; i++) {
        if (tabInfo[i].tabId == tabId) {
            return tabInfo[i].filePath;
        }
    }
}

//Checks if file is already open in a tab, returns tabInfo of aldready open tab if it is.
function fileAlreadyOpenInTab(file) {
    for (i = 0; i < tabInfo.length; i++) {
        if (tabInfo[i].filePath == file) {
            return tabInfo[i];
        }
    }

    return null;
}

//converts tabId to tab Index
function tabIdToIndex(tabId) {
    var tabIndex = $('#tabs a[href="#' + tabId + '"]').parent().index();
    return tabIndex;
}

//Cleanup after closing a tab
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
/*****************************************************
TAB SPECIFIC CODE
END
******************************************************/

/*****************************************************
SIGNALR CODE
START
******************************************************/
var hubProxy;
var suppressModelChangedEvent = false;
$(function () {
    // Reference the auto-generated proxy for the hub.  
    hubProxy = $.connection.editorHub;
    //user info
    hubProxy.state.userName = "";
    hubProxy.state.projectId = projectId.toString();

    //a new user has connected to current project
    hubProxy.client.newUserConnected = function (user) {
        console.log(user + " connected");
        //display that the user connected in chat
        $('#discussion').append('<li><i><strong>[' + getTimeStamp() + ']' + htmlEncode(user)
            + ' connected!</strong></i></li>');
    }

    //somebody requested a file
    hubProxy.client.userHasRequestedFile = function (file, connectionId) {
        console.log('searching for requested file ' + file);
        //its the file youre currently working on
        if (file == currentlyEditingFile) {
            hubProxy.server.sendRequestedFile(file, editor.getModel().getValue(), connectionId);
        }
        //if not, see if its open in a tab
        else {
            var fileTabFound = fileAlreadyOpenInTab(file);
            if (fileTabFound != null) {
                hubProxy.server.sendRequestedFile(file, fileTabFound.tabModel.getValue(), connectionId);
            }
        }
        //its not the file youre working on and not open in a tab, dont respond.
    }

    //receive file you previously requested
    hubProxy.client.receiveRequestedFile = function (file, text) {
        console.log('received requested file');
        console.log(text);
        //is the editor completely empty? just insert the text and open a new tab
        if (editor.getModel() == null) {
            openDataInMonaco(text, file, true);
        }
        else {
            //have you already opened the file from server?
            if (currentlyEditingFile == file) {
                //Dont react to edit events when inserting the new file
                suppressModelChangedEvent = true;
                editor.getModel().setValue(text);
            }
            //you havent opened the file and your editor isnt empty? just insert the text and open a new tab.
            else {
                openDataInMonaco(text, file, true);
            }
        }
    }

    //somebody made an edit in their editor
    hubProxy.client.updateEditorModel = function (filePath, startColumn, endColumn, startLineNumber, endLineNumber, textValue) {
        var editOperation = createNewEditOperation(filePath, startColumn, endColumn, startLineNumber, endLineNumber, textValue);

        //is it the file you're currently working on?
        if (currentlyEditingFile == filePath) {
            suppressModelChangedEvent = true;
            editor.executeEdits("dude", editOperation);
        }
        //or is it in a tab?
        else {
            var tab = fileAlreadyOpenInTab(filePath);
            if (tab != null)
            {
                tab.tabModel.pushEditOperations(null, editOperation)
            }
        }
    }

    //somebody is polling users in your current project from projects view
    hubProxy.client.receiveProjectPoll = function (connectionId) {
        console.log("answering project poll to id:" + connectionId);
        //answer poll 
        hubProxy.server.answerProjectPoll(projectId.toString(), connectionId);
    }

    // Somebody posted a chat message
    hubProxy.client.addNewMessageToPage = function (name, message) {
        // Add the message to the page. 
        $('#discussion').append('<li><strong>[' + htmlEncode(getTimeStamp()) + '] ' + htmlEncode(name)
            + ':</strong> ' + htmlEncode(message) + '</li>');
    };

    // Get the user name and store it to prepend to messages.
    $('#displayname').val(prompt('Enter your name:', ''));

    // Start the connection.
    $.connection.hub.start().done(function () {
        //Initialize things
        initFileTree();
        initFileTreeContextMenu();

        //advertise that you connected
        hubProxy.server.userConnected($('#displayname').val());

        //Editor model changed
        editor.onDidChangeModelContent(function (e) {
            if (suppressModelChangedEvent) {
                suppressModelChangedEvent = false;
                return;
            }
            hubProxy.server.sendEditorUpdate(currentlyEditingFile, e.range.startColumn, e.range.endColumn, e.range.startLineNumber, e.range.endLineNumber, e.text);
        });

        //Send chat message on enter
        $('#message').keydown(function (event) {
            if (event.keyCode == 13) {
                hubProxy.server.sendChat($('#displayname').val(), $('#message').val(), projectId.toString());
                $('#message').val('');
                return false;
            }
        });

    });
});
// This optional function html-encodes messages for display in the page.
function htmlEncode(value) {
    var encodedValue = $('<div />').text(value).html();
    return encodedValue;
}


/*****************************************************
SIGNALR CODE
END
******************************************************/

/*****************************************************
MISC CODE
START
******************************************************/

//Set tab of file to active and set currentlyEditingFile to current file
function setActiveFileAndTab(file, tabIndex) {
    if (tabIndex != null) {
        $('#tabs').tabs({ active: tabIndex });
    }
    currentlyEditingFile = file;
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

//Write file on server
function saveFile(file, text) {
    if (editor == null) {
        return false;
    }

    var sendData = {
        'filePath': file,
        'textValue': text,
    };

    $.ajax({
        type: "POST",
        url: 'saveFile',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(sendData),
        dataType: "json",
        success: function (data) {
            console.log(file + ' saved');
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
        }
    });
}

//Write all currently open files to server
function saveAllFiles() {
    for (var i = 0; i < tabInfo.length; i++) {
        saveFile(tabInfo[i].filePath, tabInfo[i].tabModel.getValue());
    }
}

function getTimeStamp() {
    var currentDate = new Date();
    var hours = currentDate.getHours(),
        minutes = currentDate.getMinutes()

    if (hours < 10) {
        hours = '0' + hours;
    }
    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    return hours + ':' + minutes;
}

/*****************************************************
MISC CODE
END
*********************************/
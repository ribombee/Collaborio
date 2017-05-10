var startingText = []
startingText.push("             .oo-                                                                                                                                                                      :oo`             ");
startingText.push("           :/+//.    `:::::::-                    `:::::` `:::::                  `::`                                                    .--                                     ::-  -+++/:           ");
startingText.push("        `..ss+     ``:sssssss+``                  `sssyy. .sssyy`                 -yy-                                                    /++                                     yhs     sso..`        ");
startingText.push("      ``/yy.       yyo       :yy-                    /yy.    +yy`                 -yy-                                                                                            yys       :yy:``      ");
startingText.push("     .ss/..        yyo       :yy-                    /yy.    +yy`                 -yy-                                                                                         :ss:-.       `..+ss`     ");
startingText.push("+   +o::.          yyo       .::`    .///////-       /yy.    +yy`    -///////.    -yyo///////.       :///////`    -//` ./////`            -::     -:::::::`                    /hh.            -::o+/   ");
startingText.push(".--++/             yyo             ../ooooooo/..     /yy.    +yy`    /ooooooo/..  -yyoooooooo:..  `..+ooooooo:..  /yy:.:ooooo`            /oo  `..////////-..               `../oo.               +++--`");
startingText.push("/yy-               yyo            `yy+       /yy.    /yy.    +yy`    ````````oyy  -yy-       oys  :yy-       syo  /yyss+                  /oo  .oo-       +oo               -hh:                    :hh-");
startingText.push("/yy-               yyo            `yy+       /yy.    /yy.    +yy`    /ssssssssyy  -yy-       oys  :yy-       syo  /yy-``                  /oo  .oo-       +oo               -hh:                    /hh-");
startingText.push("`..oso             yyo            `yy+       /yy.    /yy.    +yy` .oo/-------oyy  -yy-       oys  :yy-       syo  /yy.                    /oo  .oo-       +oo             ooo--`                  sso..`");
startingText.push("   :/+//.          yyo       .::` `yy+       /yy.    /yy.    +yy` .yy:       +yy  -yy-       oys  :yy-       syo  /yy.                    /oo  .oo-       +oo             yhs                  -////-   ");
startingText.push("     .oo/--`       yyo       :yy- `yy+       /yy.    /yy.    +yy` .yy:       +yy  -yy-       oys  :yy-       syo  /yy.          `````     /oo  .oo-       +oo          `..sso               `--+ss`     ");
startingText.push("        /yy-``     yyo       :yy- `yy+       /yy.    /yy.    +yy` .yy:       +yy  -yy-       oys  :yy-       syo  /yy.         .ooooo`    /oo  .oo-       +oo          /yy-``             ``:yy:        ");
startingText.push("         ``syo     ``:sssssss+``   ``/sssssss+``     /yy.    +yy`  ``+sssssssyyy  -yyssssssss:``  ```osssssss-``  /yy.         .ooooo`    /oo   ``/+++++++-``          /hh-               yyo``         ");
startingText.push("           --/++-    `:::::::-       .:::::::.       .::`    .::     .::::::::::  `::::::::::`       -:::::::`    .::`         `-----     .--     .-------`            .::`            :++:-.           ");
startingText.push("             .++-                                                                                                                                                                      :++`             ");
             

/*****************************************************
MONACO EDITOR SPECIFIC CODE
START
******************************************************/
//Editor variable, access editor with this
var editor = null;
//Filename of file currently being edited
var currentlyEditingFile = "";
//cursor info
var currentCursorLine = -1;
var cursorPositions = [];
//available languages in monaco
var availableLanguages = [];
var languageExtensions = [];

var opening = true;
const EDITOR_DEFAULT_SETTINGS = {
    readOnly: false,
    lineNumbers: true,
    fontSize: 12
}

//Initialize Monaco editor when document is ready
$(document).ready(function () {
    require.config({ paths: { 'vs': '../../EditorLibraries/Monaco/dev/vs' } });
    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('monaco-editor'),{
            value: startingText.join('\n'),
            //Hardcoded for now
            language: 'plaintext',
            readOnly: true,
            lineNumbers: false,
            fontWeight: 'bolder',
            fontSize: 7            
        });
        //set logo colors
        var decorations = [];
        decorations = inlineDecorateLines(decorations, 1, 16, 1, 18, "collaborio-logo-purple");
        decorations = inlineDecorateLines(decorations, 1, 16, 17, 127, "collaborio-logo-blue");
        decorations = inlineDecorateLines(decorations, 1, 16, 128, 160, "collaborio-logo-orange");
        decorations = inlineDecorateLines(decorations, 1, 16, 161, 250, "collaborio-logo-purple");
        editor.deltaDecorations([], decorations);

        //Get available programming languages
        availableLanguages = monaco.languages.getLanguages().map(function (language) { return language.id });
        languageExtensions = monaco.languages.getLanguages().map(function (language) { return language.extensions[0]})
        //availableLanguages.sort();

        //Populate language list
        for (var i = 0; i < availableLanguages.length; i++) {
            var o = document.createElement('option');
            o.textContent = availableLanguages[i];
            o.value = languageExtensions[i];
            $(".language-picker").append(o);
        }

        //change language with language picker
        /*$(".language-picker").change(function () {
            monaco.editor.setModelLanguage(editor.getModel(), availableLanguages[this.selectedIndex]);
        });*/

        //change theme with theme picker
        $(".theme-picker").change(function () {
            //create cookie for new theme setting
            setCookie('theme', this.selectedIndex, 100);
            changeTheme(this.selectedIndex);
        });

        var lastTheme = getCookie("theme");
        if (lastTheme != "") {
            lastTheme = parseInt(lastTheme);
            changeTheme(lastTheme);
            setThemePicker(lastTheme);
        }
        
    });
});

//Change monaco editor theme
function changeTheme(theme) {
    var newTheme = (theme === 1 ? 'vs-dark' : (theme === 0 ? 'vs' : 'hc-black'));
    editor.updateOptions({ 'theme': newTheme });
}

//returns the name of the language that corresponds to the file extension
function getLanguage(file) {
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
        url: getFileValueUrl,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(sendData),
        dataType: "json",
        success: function (data) {;
            openDataInMonaco(data, file, false);
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            console.log("why is this horrible thing happening?");
            alert(status);
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

//Set theme picker dropdown
function setThemePicker(theme) {
    $(".theme-picker")[0].selectedIndex = theme;
}

//Decorate lines other users are editing
var oldDecorations = [];
function decorateUsersInLines() {
    var fileDecorations = [];
    var newDecorations = [];

    if (oldDecorations.length < 1) {
        oldDecorations.push({
            decorations: [],
            file: currentlyEditingFile
        });
    }

    //create decorations from user positions
    for (var i = 0; i < cursorPositions.length; i++) {
        var fileFound = false;
        for (var j = 0; j < fileDecorations.length; j++) {
            if(fileDecorations[j].file == cursorPositions[i].file){
                fileFound = true;
                fileDecorations[j].decorations.push(createDecoration(cursorPositions[i].user, cursorPositions[i].lineNumber));
                break;
            }
        }
        if (!fileFound) {
            fileDecorations.push({
                file: cursorPositions[i].file,
                decorations: [createDecoration(cursorPositions[i].user, cursorPositions[i].lineNumber)]
            })
        }
    }

    //decorate the lines
    for (var i = 0; i < fileDecorations.length; i++) {
        //is it the file you're currently working on?
        if (currentlyEditingFile == fileDecorations[i].file) {
            newDecorations.push({
                decorations: editor.deltaDecorations(oldDecorations[findOldDecorationsOfFile(fileDecorations[i].file)].decorations, fileDecorations[i].decorations),
                file: fileDecorations[i].file
            });
        }
        //or is it in a tab?
        else {
            var tab = fileAlreadyOpenInTab(fileDecorations[i].file);
            if (tab != null) {
                newDecorations.push({
                    decorations: tab.tabModel.deltaDecorations(oldDecorations[findOldDecorationsOfFile(fileDecorations[i].file)].decorations, fileDecorations[i].decorations),
                    file: fileDecorations[i].file
                });
            }
        }
    }

    //is fileDecorations empty?
    if (fileDecorations.length == 0) {
        newDecorations.push({
            decorations: editor.deltaDecorations(oldDecorations[findOldDecorationsOfFile(currentlyEditingFile)].decorations, []),
            file: currentlyEditingFile
        })
        for (var i = 0; i < tabInfo.length; i++) {
            newDecorations.push({
                decorations: tabInfo[i].tabModel.deltaDecorations(oldDecorations[findOldDecorationsOfFile(tabInfo[i].filePath)].decorations, []),
                file: tabInfo[i].filePath
            })
        }
    }

    oldDecorations = newDecorations;
}

function createDecoration(user, lineNumber) {
    var decoration = {
        id: user, isForValidation: false, ownerId: 1,
        range: new monaco.Range(lineNumber, 1, lineNumber, 3000),
        options: { isWholeLine: true, inlineClassName: 'user-editing-inline', linesDecorationsClassName: 'user-editing-line', hoverMessage: user + ' is editing this line' }
    }
    return decoration;
}

function findOldDecorationsOfFile(file) {
    for (var i = 0; i < oldDecorations.length; i++) {
        if (oldDecorations[i].file == file) {
            return i;
        }
    }
}

function inlineDecorateLines(decorations, lineFrom, lineTo, startColumn, endColumn, classType) {
    for (var i = lineFrom; i <= lineTo; i++) {
        decorations.push({ range: new monaco.Range(i, startColumn, i, endColumn), options: { inlineClassName: classType } });
    }

    return decorations;
}

function removeFromCursorPositions(lineNumber, file, user) {
    for (var i = 0; i < cursorPositions.length; i++) {
        if (cursorPositions[i].user == user) {
            cursorPositions.splice(i, 1);
        }
    }

    decorateUsersInLines();
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
        var closeTabFile = currentlyEditingFile;
        var panelId = $(this).closest("li").remove().attr("aria-controls");
        $("#" + panelId).remove();
        tabRemovalCleanup(panelId, closeTabFile);
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
    if (opening) {
        editor.updateOptions(EDITOR_DEFAULT_SETTINGS);
    }

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
function tabRemovalCleanup(tabId, closeTabFile) {
    //find editor model and remove from tabInfo
    var oldModel;
    for (i = 0; i < tabInfo.length; i++) {
        if (tabInfo[i].tabId == tabId) {
            oldModel = tabInfo[i].tabModel;
            tabInfo.splice(i, 1);
        }
    }
    //save file
    saveFile(closeTabFile, oldModel.getValue());

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
var suppressLineUpdate = false;
var hasChanged = false;
var editList = [];
var editFileList = [];

const UPDATE_INTERVAL_SECONDS = 0.1;
const UPDATE_LINE_DELAY_SECONDS = 1;
const SYNC_INTERVAL_SECONDS = 30;
const EDITING_MESSAGE_TIME_SECONDS = 5;

$(function () {
    // Reference the auto-generated proxy for the hub.  
    hubProxy = $.connection.editorHub;
    //user info
    hubProxy.state.userName = userName;
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
        console.log('received file');
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
            editor.executeEdits(userName, editOperation);
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

    //someboy sent a set of updates
    hubProxy.client.receiveUpdateSet = function (filePaths, editOperations) {
        for (var i = 0; i < filePaths.length; i++) {
            var editOperation = createNewEditOperation(filePaths[i], editOperations[i].range.startColumn,
                    editOperations[i].range.endColumn, editOperations[i].range.startLineNumber, editOperations[i].range.endLineNumber,
                    editOperations[i].text);
            
            //is it the file you're currently working on?
            if (currentlyEditingFile == filePaths[i]) {
                suppressModelChangedEvent = true;
                editor.executeEdits(userName, editOperation);
            }
            //or is it in a tab?
            else {
                var tab = fileAlreadyOpenInTab(filePaths[i]);
                if (tab != null) {
                    for (var i = 0; i < editOperations.length; i++) {
                        tab.tabModel.pushEditOperations(null, editOperation);
                    }
                }
            }
        }
    }

    //Somebody is sending you an updated line
    hubProxy.client.receiveUpdatedLine = function (file, lineNumber, lineText) {
        //is it the file you're currently working on?
        if (currentlyEditingFile == file) {
            suppressModelChangedEvent = true;
            var editOperation = createNewEditOperation(file, 0,
                    editor.getModel().getLineMaxColumn(lineNumber), lineNumber, lineNumber,
                    lineText);
            editor.executeEdits("", editOperation);
        }
        //or is it in a tab?
        else {
            var tab = fileAlreadyOpenInTab(file);
            if (tab != null) {
                var editOperation = createNewEditOperation(file, 0,
                    tab.tabModel.getLineMaxColumn(lineNumber), lineNumber, lineNumber,
                    lineText);
                tab.tabModel.pushEditOperations(null, editOperation);
            }
        }
    }

    //Somebody is sending you their version of a file - sync with theirs
    hubProxy.client.receiveFile = function (file, text) {
        //is it the file you're currently working on?
        if (currentlyEditingFile == file) {
            suppressModelChangedEvent = true;
            var fullRange = editor.getModel().getFullModelRange();
            editor.executeEdits("", createNewEditOperation(file, fullRange.startColumn, fullRange.endColumn, fullRange.startLineNumber,
                fullRange.endLineNumber, text));
        }
        //or is it in a tab?
        else {
            var tab = fileAlreadyOpenInTab(file);
            if (tab != null) {
                tab.tabModel.setValue(text);
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

    //somebody sent their cursor position
    hubProxy.client.receiveCursorPosition = function (lineNumber, file, user) {
        var cursorPosition = {
            lineNumber: lineNumber,
            file: file,
            user: user
        }
        var foundUser = false;
        for (var i = 0; i < cursorPositions.length; i++) {
            if (cursorPositions[i].user == user) {
                cursorPositions[i] = cursorPosition;
                foundUser = true;
            }
        }
        if (!foundUser) {
            cursorPositions.push(cursorPosition);
        }

        decorateUsersInLines();

        //remove cursor position after
        setTimeout(function () {
            removeFromCursorPositions(lineNumber, file, user);
        }, EDITING_MESSAGE_TIME_SECONDS * 1000);
        
    };

    // Start the connection. CODE THAT HAPPENS AFTER SIGNALR CONNECTION IS ESTABLISHED HAPPENS HERE BELOW
    $.connection.hub.start().done(function () {
        //Initialize things
        initFileTree();
        initFileTreeContextMenu();

        //advertise that you connected
        hubProxy.server.userConnected(userName);

        //Editor model changed
        editor.onDidChangeModelContent(function (e) {
            if (suppressModelChangedEvent) {
                suppressModelChangedEvent = false;
                return;
            }

            editList.push(e);
            editFileList.push(currentlyEditingFile);
            hubProxy.server.sendCursorPosition(editor.getPosition().lineNumber, currentlyEditingFile);
            hasChanged = true;
        });

        //Send chat message on enter
        $('#message').keydown(function (event) {
            if (event.keyCode == 13) {
                hubProxy.server.sendChat(userName, $('#message').val(), projectId.toString());
                $('#message').val('');
                return false;
            }
        });

        //Your cursor position changed. Send clients your new cursor line
        /*
        editor.onDidChangeCursorPosition(function (event) {
            if (currentCursorLine != event.position.lineNumber) {
                hubProxy.server.sendCursorPosition(event.position.lineNumber, currentlyEditingFile);
            }
            currentCursorLine = event.position.lineNumber;
        });
        */

        //Update editor on intervals
        var editorUpdateInterval = setInterval(function () { onUpdateInterval() }, UPDATE_INTERVAL_SECONDS * 1000);
        //Push sync on intervals
        var editorSyncInterval = setInterval(function () { onSyncInterval() }, SYNC_INTERVAL_SECONDS * 1000);

    });
});
// This optional function html-encodes messages for display in the page.
function htmlEncode(value) {
    var encodedValue = $('<div />').text(value).html();
    return encodedValue;
}

function onUpdateInterval() {
    if (editList.length > 0) {
        hubProxy.server.sendEditorUpdates(editFileList, editList);
        var lineToUpdate = editList[editList.length-1].range.startLineNumber;
        var fileToUpdate = editFileList[editFileList.length-1];
        editList = [];
        editFileList = [];

        if (!suppressLineUpdate) {
            suppressLineUpdate = true;
            //send whole edited line after delay, to ensure sync
            setTimeout(function () {
                hubProxy.server.sendEditorUpdatedLine(fileToUpdate, lineToUpdate, editor.getModel().getLineContent(lineToUpdate));
                suppressLineUpdate = false;
            }, UPDATE_LINE_DELAY_SECONDS * 1000);
        }
    }
}

function onSyncInterval() {
    if (hasChanged) {
        hubProxy.server.sendFile(currentlyEditingFile, editor.getModel().getValue());
        hasChanged = false;
    }
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

//create file on server when newFile post is submitted
$('#filePost').submit(function (event) {
    $.ajax({
        type: "POST",
        url: createFileUrl,
        data: $('#filePost').serialize(),
    })
    setTimeout(function () { refreshFileTree(); }, 500);
    $('#myModal').modal('hide');
    event.preventDefault();
    return false;
});

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
        url: saveFileUrl,
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

//save all files on window close
window.onbeforeunload = function () {
    saveAllFiles();
}

//get preference from cookie
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function setCookie(attribute, value, exdays) {
    var date = new Date();
    date.setTime(date.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + date.toUTCString();
    document.cookie = attribute + "=" + value + ";" + expires + ";path=/";
}

function addUserToProject(projectId, user, editPermission)
{
    var sendData = {
        'projectId': projectId,
        'userName': user,
        'permission': editPermission
    }

    $.ajax({
        type: "POST",
        url: addUserUrl,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(sendData),
        dataType: "json",
        success: function (result) {
            if (!result) {
                //the controller function returns false if it does not add a user.
                alert("No such user exists");
            }
            else {
                fetchCollaboratorsForModal();
            }
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
        }
    });
}

function fetchCollaboratorsForModal() {

    var sendData = JSON.stringify({
        'projectId': projectId,
    });
    console.log(sendData);
    //we fetch all collaborators
    $.ajax({
        type: "POST",
        url: getUserUrl,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: sendData,
        success: function (response) {
            console.log(response);
            var collaboratorsHtml = "";
            for (var i in response) {

                if (!response.hasOwnProperty(i)) {
                    //this skips anything irrelevant to us
                    continue;
                }
                //if it's relevant, we add it
                collaboratorsHtml += "<div class=\"collaboratingUser\" >" + response[i].UserId + "</div>";
            }
            //and put it in the appropriate div
            $('#collaboratorList').html(collaboratorsHtml);
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
        }
    });

}

//when we open the modal, we want to get the latest info on collaborators from the database
$('#addUserButton').click(function () {
    fetchCollaboratorsForModal();
});

//upon submitting the form we add the user entered and reload the list of collaborators
$('#addSingleUser').click(function () {
    addUserToProject(projectId, $('#userToAdd').val(), 1);
    $('#userToAdd').val("");

});
//enter works like the add button 
$('#userToAdd').keydown(function (event) {
    if (event.keyCode == 13) {
        addUserToProject(projectId, $('#userToAdd').val(), 1);
        $('#userToAdd').val("");
    }
});

/*****************************************************
MISC CODE
END
*********************************/
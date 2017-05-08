/*****************************************************
SIGNALR CODE
START
******************************************************/
$(function () {
    // Reference the auto-generated proxy for the hub.  
    var hubProxy = $.connection.editorHub;
    //user info
    hubProxy.state.userName = "";

    // A user answered project poll
    hubProxy.client.userAnsweredProjectPoll = function (projectId) {
        updateUserCountInProject(projectId);
    };

    // Start the connection.
    $.connection.hub.start().done(function () {
        console.log("connected!");
        //Poll users in projects to see how many are working in each project
        hubProxy.server.pollUsersInProjects(projectIds);
    });
});
/*****************************************************
SIGNALR CODE
END
******************************************************/

/*****************************************************
MISC CODE
START
******************************************************/
//Update user count in project - still a proof of concept, has no style
function updateUserCountInProject(projectId) {
    var projectHtmlId = '#project-' + projectId
    var currentlyEditingCount = $(projectHtmlId).data('editing')+1;
    $(projectHtmlId).text('Click here - ' + currentlyEditingCount + ' users currently editing');
    $(projectHtmlId).data('editing', currentlyEditingCount);
}


/*****************************************************
MISC CODE
START
******************************************************/
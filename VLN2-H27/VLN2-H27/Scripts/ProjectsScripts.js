/*****************************************************
SIGNALR CODE
START
******************************************************/
$(function () {
    // Reference the auto-generated proxy for the hub.  
    var hubProxy = $.connection.editorHub;
    //user info
    hubProxy.state.userName = "";

    // Somebody posted a chat message
    hubProxy.client.userAnsweredProjectPoll = function (projectId) {
        
    };

    // Start the connection.
    $.connection.hub.start().done(function () {
        //Poll users in projects to see how many are working in each project
        hubProxy.server.pollUsersInProject("0");
    });
});
/*****************************************************
SIGNALR CODE
END
******************************************************/
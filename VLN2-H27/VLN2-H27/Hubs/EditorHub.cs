using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;

namespace VLN2_H27.Hubs
{
    public class EditorHub : Hub
    {
        public void SendChat(string name, string message, string projectId)
        {
            // Call the addNewMessageToPage method to update clients.
            Clients.Group(projectId).addNewMessageToPage(name, message);
        }

        public void SendEditorUpdate(string filePath, int startColumn, int endColumn, int startLineNumber, int endLineNumber, string textValue)
        {
            Clients.OthersInGroup(Clients.Caller.projectId).updateEditorModel(filePath, startColumn, endColumn, startLineNumber, endLineNumber, textValue);
        }

        public async Task userConnected(string userName)
        {
            await Groups.Add(Context.ConnectionId, Clients.Caller.projectId);
            Clients.OthersInGroup(Clients.CallerState.projectId).newUserConnected(userName);
        }

        public void RequestFile(string file)
        {
            Clients.OthersInGroup(Clients.CallerState.projectId).userHasRequestedFile(file, Context.ConnectionId);
        }

        public void SendRequestedFile(string file, string text, string connectionId)
        {
            Clients.Client(connectionId).receiveRequestedFile(file, text);
        }

        public void pollUsersInProject(string projectId)
        {
            System.Diagnostics.Debug.WriteLine(Context.ConnectionId);
            Clients.Group(projectId).receiveProjectPoll(Context.ConnectionId);
        }

        public void answerProjectPoll(string projectId, string connectionId)
        {
            System.Diagnostics.Debug.WriteLine(connectionId);
            Clients.Client(connectionId).userAnsweredProjectPoll(projectId);
        }

    }
}
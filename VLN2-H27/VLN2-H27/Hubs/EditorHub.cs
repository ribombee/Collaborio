using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace VLN2_H27.Hubs
{
    public class EditorHub : Hub
    {
        public void SendChat(string name, string message)
        {
            // Call the addNewMessageToPage method to update clients.
            Clients.All.addNewMessageToPage(name, message);
        }

        public void SendEditorUpdate(string filePath, int startColumn, int endColumn, int startLineNumber, int endLineNumber, string textValue)
        {
            Clients.Others.updateEditorModel(filePath, startColumn, endColumn, startLineNumber, endLineNumber, textValue);
        }

        public void userConnected(string user)
        {
            Clients.Others.newUserConnected(user);
        }

        public void RequestFile(string file)
        {
            Clients.Others.userHasRequestedFile(file, Context.ConnectionId);
        }

        public void SendRequestedFile(string file, string text, string connectionId)
        {
            Clients.Client(connectionId).receiveRequestedFile(file, text);
        }

    }
}
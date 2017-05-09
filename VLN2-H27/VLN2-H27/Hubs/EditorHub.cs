using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using Newtonsoft.Json;

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

        public void SendEditorUpdates(List<string> filePaths, List<editOperation> editOperations)
        {
            Clients.OthersInGroup(Clients.Caller.projectId).receiveUpdateSet(filePaths, editOperations);
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
            Clients.Group(projectId).receiveProjectPoll(Context.ConnectionId);
        }

        public void pollUsersInProjects(List<string> projectIds)
        {
            Clients.Groups(projectIds).receiveProjectPoll(Context.ConnectionId);
        }

        public void answerProjectPoll(string projectId, string connectionId)
        {
            Clients.Client(connectionId).userAnsweredProjectPoll(projectId);
        }

        public void sendCursorPosition(int lineNumber, string filePath)
        {
            Clients.OthersInGroup(Clients.CallerState.projectId).receiveCursorPosition(lineNumber, filePath, Clients.CallerState.userName);
        }

    }

    public class range
    {
        [JsonProperty("endColumn")]
        public int endColumn { get; set; }

        [JsonProperty("endLineNumber")]
        public int endLineNumber { get; set; }

        [JsonProperty("startColumn")]
        public int startColumn { get; set; }

        [JsonProperty("startLineNumber")]
        public int startLineNumber { get; set; }
    }

    public class editOperation
    {
        [JsonProperty("eol")]
        public string eol { get; set; }

        [JsonProperty("isRedoing")]
        public Boolean isRedoing { get; set; }

        [JsonProperty("isUndoing")]
        public Boolean isUndoing { get; set; }

        [JsonProperty("range")]
        public range editRange { get; set; }

        [JsonProperty("rangeLength")]
        public int rangeLength { get; set; }

        [JsonProperty("text")]
        public string text { get; set; }

        [JsonProperty("versionId")]
        public string versionId { get; set; }
    }
}
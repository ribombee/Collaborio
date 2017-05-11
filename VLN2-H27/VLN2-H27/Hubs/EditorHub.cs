using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Diagnostics;

namespace VLN2_H27.Hubs
{
    public class EditorHub : Hub
    {
        public void sendChat(string name, string message, string projectId)
        {
            Clients.Group(projectId).addNewMessageToPage(name, message);
        }

        public void sendLineDelete(string filePath, int startColumn, int endColumn, int startLineNumber, int endLineNumber)
        {
            Clients.OthersInGroup(Clients.Caller.projectId).receiveLineDelete(filePath, startColumn, endColumn, startLineNumber, endLineNumber);
        }

        public void sendEditorUpdates(List<string> filePaths, List<editOperation> editOperations)
        {
            Clients.OthersInGroup(Clients.Caller.projectId).receiveUpdateSet(filePaths, editOperations);
        }

        public void sendEditorUpdatedLine(string file, string text, Range range)
        {
            Clients.OthersInGroup(Clients.Caller.projectId).receiveUpdatedLine(file, text, range);
        }
        
        public void sendNewline(string file, Range range)
        {
            Clients.OthersInGroup(Clients.Caller.projectId).receiveNewline(file, range);
        }

        public void sendDeleteUpdate(string file, int startLineNumber, int startColumn, int offset)
        {
            Clients.OthersInGroup(Clients.Caller.projectId).receiveDeleteUpdate(file, startLineNumber, startColumn, offset);
        }

        public void sendFile(string file, string text)
        {
            Clients.OthersInGroup(Clients.Caller.projectId).receiveFile(file, text);
        }

        public async Task userConnected(string userName)
        {
            await Groups.Add(Context.ConnectionId, Clients.Caller.projectId);
            Clients.OthersInGroup(Clients.CallerState.projectId).newUserConnected(userName);
        }

        public void requestFile(string file)
        {
            Clients.OthersInGroup(Clients.CallerState.projectId).userHasRequestedFile(file, Context.ConnectionId);
        }

        public void sendRequestedFile(string file, string text, string connectionId)
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

    public class Range
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
        public Range range { get; set; }

        [JsonProperty("rangeLength")]
        public int rangeLength { get; set; }

        [JsonProperty("text")]
        public string text { get; set; }

        [JsonProperty("versionId")]
        public string versionId { get; set; }
    }
}
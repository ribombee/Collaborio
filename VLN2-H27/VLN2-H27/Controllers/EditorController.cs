using Ionic.Zip;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using VLN2_H27.Models;

namespace VLN2_H27.Controllers
{
    [Authorize]
    public class EditorController : Controller
    {

        // GET: Editor
        public ActionResult projects()
        {
            var userId = User.Identity.GetUserId();
            //get all projects related to logged in user
            VLN2_2017_H27Entities2 db = new VLN2_2017_H27Entities2 { };
            var queryResult = from rel in db.Project_Users_Relations
                              where rel.UserId == userId
                              join pro in db.Projects on rel.ProjectId equals pro.Id
                              select pro;
            ViewBag.projects = queryResult;
            int[] idList = queryResult.Select(x => x.Id).ToArray();
            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(idList);
            ViewBag.projectIdsJson = json;
            return View();
        }

        public ActionResult editor(int? Id)
        {
            var userId = User.Identity.GetUserId();
            VLN2_2017_H27Entities2 db = new VLN2_2017_H27Entities2 { };
            var queryResult = (from rel in db.Project_Users_Relations
                              where rel.UserId == userId
                              && rel.ProjectId == Id
                              select rel).FirstOrDefault();
            IEnumerable<SelectListItem> emptyList = new SelectListItem[] { };
            ViewBag.emptyList = emptyList;
            ViewBag.UserName = User.Identity.GetUserName();
            
            if(queryResult != null)
            {
                if (Id.HasValue && (queryResult.ProjectId == Id))
                {
                    ViewBag.editPermission = queryResult.EditPermission;
                    ViewBag.projectId = Id;
                    return View();
                }
            }
            return RedirectToAction("projects");
        }

        
        public JsonResult fileExists(string filePath)
        {
            if(System.IO.File.Exists(filePath))
            {
                return Json(1);
            }
            else
            {
                return Json(0);
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult getFileValue(string filePath)
        {
            string path = filePath;
            path = Server.MapPath(path);
            string fileText = "";

            try
            {
                fileText = System.IO.File.ReadAllText(path);
            }
            catch
            {
                Debug.WriteLine("File read error");
            }

            return Json(fileText);
        }

        [HttpPost]
        [AllowAnonymous]
        public JsonResult saveFile(string filePath, string textValue)
        {
            string path = filePath;
            path = Server.MapPath(path);
            Debug.WriteLine(textValue);
            try
            {
                System.IO.File.WriteAllText(path, textValue);
            }
            catch
            {
                Debug.WriteLine("Writing to " + filePath + "failed");
            }

            return null;
        }

        [HttpPost]
        public ActionResult createProject(FormCollection data)
        {
            string fileName = data[0];

            //insert the new project into our database
            Project newProject = new Project
            {
                ProjectName = fileName,
                DateAdded = DateTime.Now,
                LastModified = DateTime.Now,
                NrOfUsers = 1,
            };

            VLN2_2017_H27Entities2 db = new VLN2_2017_H27Entities2 { };

            db.Projects.Add(newProject);
            db.SaveChanges();

            //get project Id from database
            var tempProject = (from project in db.Projects
                               where project.ProjectName == newProject.ProjectName
                               orderby project.DateAdded descending
                               select project).First();
            int projectId = tempProject.Id;


            Project_Users_Relations relation = new Project_Users_Relations
            {
                ProjectId = projectId,
                UserId = User.Identity.GetUserId(),
                EditPermission = true
            };

            db.Project_Users_Relations.Add(relation);
            db.SaveChanges();

            //we then create folder structure
            //we build the folder path as a virtual path
            var folderPath = "~/UserProjects/" + projectId;
            //then we realize it as a physical path
            folderPath = Server.MapPath(folderPath);

            if (!Directory.Exists(folderPath))
            {
                DirectoryInfo di = Directory.CreateDirectory(folderPath);
            }


            var filePath = "~/UserProjects/" + projectId + "/" + tempProject.ProjectName + ".cpp";
            filePath = Server.MapPath(filePath);
            var text = "cout << \"this is my auto-generated text!\" << endl";
            System.IO.File.WriteAllText(filePath, text);


            return RedirectToAction("editor", new { Id = projectId });
        }

        [HttpPost]
        public ActionResult createFile(FormCollection data)
        {
            Debug.WriteLine(data[1]);
            var filePath = "~/UserProjects/" + data[0] + "/" + data[1] + data[2];
            filePath = Server.MapPath(filePath);
            var text = "cout << \"this is my auto-generated text!\" << endl";

            JsonResult fileExists = new JsonResult { };
            fileExists.Data = System.IO.File.Exists(filePath);

            if(!System.IO.File.Exists(filePath))
            {
                //this file does not already exist so we can create it!
                System.IO.File.WriteAllText(filePath, text);
            }
            //we return a boolean value that indicates whether or not the file exists so we can display an error if it does!
            return fileExists;
        }

        public JsonResult renameFile(FormCollection data)
        {
            /*
            string oldFilePath = 

            path = Server.MapPath(path);
            Debug.WriteLine(textValue);
            try
            {
                System.IO.File.Replace(oldFilePath, newFilePath);
                System.IO.File.WriteAllText(path, textValue);
            }
            catch
            {
                Debug.WriteLine("Writing to " + filePath + "failed");
            }

            return null;

            
            */
            return null;
        }
        public JsonResult deleteFile(string fileName)
        {
            string filePath = "~" + fileName;
            filePath = Server.MapPath(filePath);
            Debug.WriteLine(fileName);
            JsonResult isDeleted = new JsonResult { };
            try
            {
                System.IO.File.Delete(filePath);
                isDeleted.Data = true;
            }
            catch
            {
                isDeleted.Data = false;
                Debug.WriteLine("deleting " + fileName + " failed");
            }
            return isDeleted;
        }

        public JsonResult getUsers(int projectId)
        {
            VLN2_2017_H27Entities2 db = new VLN2_2017_H27Entities2 { };

            IEnumerable<Project_Users_Relations> collaborators = (from relations in db.Project_Users_Relations
                                                                          where relations.ProjectId == projectId
                                                                          select relations).AsEnumerable();
            //fetching the username to display
            foreach(var collaborator in collaborators)
            {
                collaborator.UserId = (from users in db.AspNetUsers
                                       where users.Id == collaborator.UserId
                                       select users.UserName).FirstOrDefault();
            }

            JsonResult collaboratorsJson = new JsonResult();
            collaboratorsJson.Data = collaborators;

            return collaboratorsJson;
        }

        [HttpPost]
        public JsonResult addUser(int projectId, string userName, bool permission)
        {
            //initialise database and jsonresult (bool)
            VLN2_2017_H27Entities2 db = new VLN2_2017_H27Entities2 { };
            JsonResult wasEntered = new JsonResult();


            var tempUser = (from user in db.AspNetUsers
                            where user.UserName == userName
                            select user).FirstOrDefault();

            if(tempUser == null)
            {
                //this user does not exist, we return false.
                wasEntered.Data = false;
                return wasEntered;
            }

            //we check to see if this user already has access
            var existingEntry = (from relation in db.Project_Users_Relations
                                    where relation.ProjectId == projectId && relation.UserId == tempUser.Id
                                    select relation).FirstOrDefault();

            if (existingEntry == null)
            {
                //if the user does not have access we create a new entry in the table to give them access
                Project_Users_Relations newRelation = new Project_Users_Relations
                {
                    ProjectId = projectId,
                    UserId = tempUser.Id,
                    EditPermission = permission,
                };
                db.Project_Users_Relations.Add(newRelation);

                Project theProject = db.Projects.FirstOrDefault(x => x.Id == projectId);
                theProject.NrOfUsers++;
            }
            else
            {
                //if there is already en entry for this user, we set the permission as whatever was submitted.
                existingEntry.EditPermission = permission;
            }

            db.SaveChanges();
            wasEntered.Data = true;
            return wasEntered;
        }

        public ActionResult getProjectZip(int projectId)
        {
            using (ZipFile zip = new ZipFile())
            {
                zip.AddDirectory(Server.MapPath("~/UserProjects/" + projectId + "/"));

                MemoryStream output = new MemoryStream();
                zip.Save(output);
                output.Seek(0, SeekOrigin.Begin);
                return File(output, "application/zip", projectId+".zip");
            }
        }
    }
}
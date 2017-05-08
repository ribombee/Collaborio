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
<<<<<<< HEAD
            var projectList = queryResult.ToArray();
            Debug.WriteLine("typeOf: " + projectList.GetType());
            ViewBag.projects = projectList;
=======
            ViewBag.projects = queryResult;
            int[] idList = queryResult.Select(x => x.Id).ToArray();
            var serializer = new JavaScriptSerializer();
            var json = serializer.Serialize(idList);
            ViewBag.projectIdsJson = json;
>>>>>>> 1c10eee3ed9d688971a8247c640cbb1deeae352e
            return View();
        }
        public ActionResult editor(int? Id)
        {
            ViewBag.UserName = User.Identity.GetUserName();
            if (Id.HasValue)
            {
                ViewBag.projectId = Id;
                return View();
            }
            else
            {
                return RedirectToAction("projects");
            }
        }

        [HttpPost]
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
        public ActionResult saveFile(string filePath, string textValue)
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
                UserId = User.Identity.GetUserId()
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


            return RedirectToAction("projects");
        }
    }
}
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VLN2_H27.Models;

namespace VLN2_H27.Controllers
{
    public class EditorController : Controller
    {
        

        // GET: Editor
        public ActionResult projects()
        {
            return View();
        }
        public ActionResult editor()
        {
            ViewBag.projectId = 0;
            return View();
        }

        public ActionResult updateFile(string filePath, int linePosX, int linePosY, char charValue)
        {
            string fileLine = System.IO.File.ReadAllLines(filePath)[linePosY];
            fileLine.Insert(linePosX, Convert.ToString(charValue));
            return View("editor");
        }

        [HttpPost]
        public ActionResult createProject(FormCollection data)
        {
            string fileName = data[0];
            //first we build the folder path as a virtual path
            var folderPath = "~/FileTree/sample/" + fileName;
            //then we realize it as a physical path
            folderPath = Server.MapPath(folderPath);

            if (!Directory.Exists(folderPath))
            {
                DirectoryInfo di = Directory.CreateDirectory(folderPath);
            }


            var filePath = "~/FileTree/sample/" + fileName + "/" + fileName + ".cpp";
            filePath = Server.MapPath(filePath);
            var text = "cout << \"this is my auto-generated text!\" << endl";
            System.IO.File.WriteAllText(filePath, text);

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

               
            return View("projects");
        }
    }
}
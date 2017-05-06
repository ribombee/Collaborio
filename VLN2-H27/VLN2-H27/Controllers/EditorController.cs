using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VLN2_H27.Models;

namespace VLN2_H27.Controllers
{
    

    public class EditorController : Controller
    {
        static public List<VLN2_H27.Helpers.openFile> openFiles;

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

        [HttpPost]
        [AllowAnonymous]
        public ActionResult updateFile(string filePath, int startColumn, int endColumn, int startLineNumber, int endLineNumber, string textValue)
        {
            string path = filePath;
            path = Server.MapPath(path);

            startColumn--;
            endColumn--;
            startLineNumber--;
            endLineNumber--;

            if (openFiles == null)
            {
                openFiles = new List<Helpers.openFile>(0);
            }

            for (int i = 0; i < openFiles.Count; i++)
            {
                if(openFiles[i].isThisFile(path))
                {
                    Debug.WriteLine("open file found!");
                    openFiles[i].updateFile(startColumn, endColumn, startLineNumber, endLineNumber, textValue);
                    Debug.WriteLine(openFiles[i].getValue());
                    return null;
                }
            }

            Debug.WriteLine("NO open file found!");
            var newFile = new Helpers.openFile(path);
            newFile.updateFile(startColumn, endColumn, startLineNumber, endLineNumber, textValue);
            openFiles.Add(newFile);

            Debug.WriteLine(openFiles.Count + " open files");

            return null;

            /*
            string path = filePath;
            path = Server.MapPath(path);

            column--;
            row--;
            Debug.WriteLine("Column: " + column + " Row: " + row);
            Debug.WriteLine("FilePath: " + path);

            var fileLines = System.IO.File.ReadAllLines(path);
            
            if (updateMode == 0)
            {
                fileLines[row] = fileLines[row].Insert(column, textValue);
            }
            else
            {
                fileLines[row] = fileLines[row].Remove(column);
            }
            System.IO.File.WriteAllLines(path, fileLines);

            return null;
            */
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
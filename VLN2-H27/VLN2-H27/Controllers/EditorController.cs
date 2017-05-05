using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

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
            string path = "~/UserProjects/" + 0;
            ViewBag.projectPath = Server.MapPath(path);
            
            return View();
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


            return View("projects");
        }
    }
}
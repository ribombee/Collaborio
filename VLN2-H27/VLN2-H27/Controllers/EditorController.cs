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
            return View();
        }

        [HttpPost]
        public ActionResult createProject(FormCollection data)
        {
            string fileName = data[0];
            var path = "~/App_Data/UserProjects/" + fileName;
            path = Server.MapPath(path);

            if (!Directory.Exists(path))
            {
                DirectoryInfo di = Directory.CreateDirectory(path);
            }
            

            return View("projects");
        }
    }
}
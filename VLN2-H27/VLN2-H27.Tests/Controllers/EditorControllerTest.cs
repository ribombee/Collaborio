using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using VLN2_H27.Controllers;
using VLN2_H27.Models;

namespace VLN2_H27.Tests.Controllers
{
    [TestClass]
    public class EditorControllerTest
    {
        MockDataContext mockDb;
        VLN2_2017_H27Entities2 db;

        [TestInitialize]
        public void initialize()
        {
            mockDb = new MockDataContext();
            var project1 = new Project
            {
                ProjectName = "MyTestProject1",
                DateAdded = DateTime.Now,
                LastModified = DateTime.Now,
                Id = 0,
            };
            mockDb.Projects.Add(project1);
            var project2 = new Project
            {
                ProjectName = "MyTestProject2",
                DateAdded = DateTime.Now,
                LastModified = DateTime.Now,
                Id = 1,
            };
            mockDb.Projects.Add(project2);
            var relation1 = new Project_Users_Relations
            {
                Id = 0,
                UserId = "testId",
                ProjectId = 0,
            };
            mockDb.Project_Users_Relations.Add(relation1);
            var relation2 = new Project_Users_Relations
            {
                Id = 1,
                UserId = "testId",
                ProjectId = 1,
            };
            mockDb.Project_Users_Relations.Add(relation2);

            db = new VLN2_2017_H27Entities2(mockDb);
        }
        [TestMethod]
        public void TestProjectsExist()
        {
           

            var controller = new EditorController();

            string userid = "testId";

            var controllerContext = new Mock<ControllerContext>();
            var principal = new Mock<IPrincipal>();
            principal.SetupGet(x => x.Identity.IsAuthenticated).Returns(true);
            controllerContext.SetupGet(x => x.HttpContext.User).Returns(principal.Object);
            controller.ControllerContext = controllerContext.Object;


            //var projectList = db.getUserRelatedProjects(userid);
            Assert.AreEqual(2, projectList.Count());
        }
        [TestMethod]
        public void TestCreateExistsDeleteFile()
        {
            var controller = new EditorController();

            var controllerContext = new Mock<ControllerContext>();
            var principal = new Mock<IPrincipal>();
            principal.SetupGet(x => x.Identity.IsAuthenticated).Returns(true);
            controllerContext.SetupGet(x => x.HttpContext.User).Returns(principal.Object);
            controller.ControllerContext = controllerContext.Object;

            var filePath = "~/UserProjects/testProject/testProject.cpp";
            filePath = controller.Server.MapPath(filePath);
            //FormCollection projectData = new FormCollection();
            //projectData.Add("Project name", "testProject");
            //var result = controller.createFile(projectData) as ViewResult;
        }
        /*
        [TestMethod]
        public void TestLoggedIn()
        {
            var homeController = new HomeController();
            var editController = new EditorController();

            var controllerContext = new Mock<ControllerContext>();
            var principal = new Mock<IPrincipal>();
            principal.SetupGet(x => x.Identity.IsAuthenticated).Returns(true);
            controllerContext.SetupGet(x => x.HttpContext.User).Returns(principal.Object);
            homeController.ControllerContext = controllerContext.Object;
            editController.ControllerContext = controllerContext.Object;

            var result = homeController.Index() as RedirectToRouteResult;
            Assert.IsNotNull(result);
        }*/
    }
}

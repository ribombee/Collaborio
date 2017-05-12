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
        [TestInitialize]
        public void initialize()
        {
            var mockDb = new MockDataContext();
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
                UserId = "N",
                ProjectId = 0,
            };
            mockDb.Project_Users_Relations.Add(relation1);
            var relation2 = new Project_Users_Relations
            {
                Id = 1,
                UserId = "N",
                ProjectId = 1,
            };
            mockDb.Project_Users_Relations.Add(relation2);

            VLN2_2017_H27Entities2 db = new VLN2_2017_H27Entities2(mockDb);
        }
        [TestMethod]
        public void TestProjectsExist()
        {
            var controller = new EditorController();


            string username = "username";
            string userid = Guid.NewGuid().ToString("N"); //could be a constant

            List<Claim> claims = new List<Claim>{
                new Claim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name", username),
                new Claim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", userid)
            };
            var genericIdentity = new GenericIdentity("");
            genericIdentity.AddClaims(claims);
            var genericPrincipal = new GenericPrincipal(genericIdentity, new string[] { "" });

            var controllerContext = new Mock<ControllerContext>();
            var principal = new Mock<IPrincipal>();
            controllerContext.SetupGet(x => x.HttpContext.User).Returns(genericPrincipal);
            principal.SetupGet(x => x.Identity.IsAuthenticated).Returns(true);
            controllerContext.SetupGet(x => x.HttpContext.User).Returns(principal.Object);
            controller.ControllerContext = controllerContext.Object;

            var queryResult = from rel in db.Project_Users_Relations
                              where rel.UserId == userId
                              join pro in db.Projects on rel.ProjectId equals pro.Id
                              select pro;
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

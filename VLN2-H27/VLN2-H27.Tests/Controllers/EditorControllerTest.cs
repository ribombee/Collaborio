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
            var user1 = new AspNetUser
            {
                Id = "testId1"
            };
            mockDb.AspNetUsers.Add(user1);
            var user2 = new AspNetUser
            {
                Id = "testId2"
            };
            mockDb.AspNetUsers.Add(user2);
            var user3 = new AspNetUser
            {
                Id = "testId4"
            };
            mockDb.AspNetUsers.Add(user3);
            db = new VLN2_2017_H27Entities2(mockDb);
        }
        [TestMethod]
        public void TestProjectsExist()
        {
            var controller = new EditorController();

            string userid = "testId";

            var projectList = db.getUserRelatedProjects(userid);
            Assert.AreEqual(2, projectList.Count());
        }
        [TestMethod]
        public void TestEditorWithoutPermission()
        {
            var controller = new EditorController();

            string userid = "wrongTestId";

            int projectid = 0;

            var projectList = db.getUserProjectRelation(userid, projectid);
            Assert.IsNull(projectList);
        }
        [TestMethod]
        public void TestEditorWithPermission()
        {
            var controller = new EditorController();

            string userid = "testId";

            int projectid = 0;

            var projectList = db.getUserProjectRelation(userid, projectid);
            Assert.IsNotNull(projectList);
        }
        
        [TestMethod]
        public void TestUsersExist()
        {
            var user1 = db.getUser("testId1");
            var user2 = db.getUser("testId2");
            var user3 = db.getUser("testId3");
            var user4 = db.getUser("testId4");

            Assert.IsNotNull(user1);
            Assert.IsNotNull(user2);
            Assert.IsNull(user3);
            Assert.IsNotNull(user4);
        }
    }
}

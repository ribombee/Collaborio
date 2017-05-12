using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Principal;
using System.Web;
using System.Web.Mvc;
using VLN2_H27.Controllers;

namespace VLN2_H27.Tests.Controllers
{
    [TestClass]
    public class HomeControllerTest
    {
        [TestMethod]
        public void TestNotLoggedIn()
        {
            var controller = new HomeController();

            var controllerContext = new Mock<ControllerContext>();
            var principal = new Mock<IPrincipal>();
            principal.SetupGet(x => x.Identity.IsAuthenticated).Returns(false);
            controllerContext.SetupGet(x => x.HttpContext.User).Returns(principal.Object);
            controller.ControllerContext = controllerContext.Object;

            var result = controller.Index() as ViewResult;
            Assert.AreEqual("Index", result.ViewName);
        }

        [TestMethod]
        public void TestLoggedIn()
        {
            var homeController = new HomeController();

            var controllerContext = new Mock<ControllerContext>();
            var principal = new Mock<IPrincipal>();
            principal.SetupGet(x => x.Identity.IsAuthenticated).Returns(true);
            controllerContext.SetupGet(x => x.HttpContext.User).Returns(principal.Object);
            homeController.ControllerContext = controllerContext.Object;

            var result = homeController.Index() as RedirectToRouteResult;
            Assert.IsNotNull(result);
        }
    }

}

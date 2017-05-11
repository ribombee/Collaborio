using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using VLN2_H27.Models;
using VLN2_H27.Services;

namespace VLN2_H27.Tests.Services
{
    [TestClass]
    public class FileServiceTest
    {

        [TestInitialize]
        public void Initialize()
        {
            // Set up our mock database. In this case,
            // we only have to worry about one table
            // with 3 records:
            var mockDb = new MockDataContext();
            var f1 = new FriendConnection
            {
                ID = 1,
                Friend1 = "dabs",
                Friend2 = "nonni"
            };
            mockDb.FriendConnections.Add(f1);

            var f2 = new FriendConnection
            {
                ID = 2,
                Friend1 = "gunna",
                Friend2 = "dabs"
            };
            mockDb.FriendConnections.Add(f2);
            var f3 = new FriendConnection
            {
                ID = 3,
                Friend1 = "gunna",
                Friend2 = "nonni"
            };
            mockDb.FriendConnections.Add(f3);
            
            // Note: you only have to add data necessary for this
            // particular service (FriendService) to run properly.
            // There will be more tables in your DB, but you only
            // need to provide the data for the methods you are
            // actually testing here.

             _service = new FriendService(mockDb);
        }
        [TestMethod]
        public void TestMethod1()
        {
            // Arrange:
            const string userName = "dabs";

            // Act:
            var friends = _service.GetFriendsFor(userName);

            // Assert:
            Assert.AreEqual(2, friends.Count);
            foreach (var item in friends)
            {
                Assert.AreNotEqual(item, "dabs");
            }
        }
    }
}

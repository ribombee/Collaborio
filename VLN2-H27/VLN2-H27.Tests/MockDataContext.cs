using System.Data.Entity;
using VLN2_H27.Models;

namespace VLN2_H27.Tests
{
	class MockDataContext : IAppDataContext
    {
		/// <summary>
		/// Sets up the fake database.
		/// </summary>
		public MockDataContext()
		{
			// We're setting our DbSets to be InMemoryDbSets rather than using SQL Server.
			FriendConnections  = new InMemoryDbSet<FriendConnection>();
		}

        public IDbSet<FriendConnection> FriendConnections { get; set; }
        // TODO: bætið við fleiri færslum hér
        // eftir því sem þeim fjölgar í AppDataContext klasanum ykkar!

		public int SaveChanges()
		{
			// Pretend that each entity gets a database id when we hit save.
			int changes = 0;

			return changes;
		}

		public void Dispose()
		{
			// Do nothing!
		}
	}
}

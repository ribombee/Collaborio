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
			this.AspNetUsers  = new InMemoryDbSet<AspNetUser>();
            this.Projects = new InMemoryDbSet<Project>();
            this.Project_Users_Relations = new InMemoryDbSet<Project_Users_Relations>();
		}
        public IDbSet<AspNetUserLogin> AspNetLogins { get; set; }
        public IDbSet<AspNetUser> AspNetUsers { get; set; }
        public IDbSet<Project> Projects { get; set; }
        public IDbSet<Project_Users_Relations> Project_Users_Relations { get; set; }


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

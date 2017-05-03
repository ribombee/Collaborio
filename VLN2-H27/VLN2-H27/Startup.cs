using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(VLN2_H27.Startup))]
namespace VLN2_H27
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}

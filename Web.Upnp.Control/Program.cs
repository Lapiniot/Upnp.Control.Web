using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace Web.Upnp.Control
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webHostBuilder => webHostBuilder.UseStartup<Startup>())
                .UseWindowsService()
                .UseSystemd()
                .Build()
                .Run();
        }
    }
}
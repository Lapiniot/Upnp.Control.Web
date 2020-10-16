using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control.Services;

namespace Web.Upnp.Control
{
    public class Program
    {
        public static Task Main(string[] args)
        {
            return Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webHostBuilder => webHostBuilder.UseStartup<Startup>())
                .ConfigureServices(services => services.AddHostedService<UpnpDiscoveryService>())
                .UseWindowsService()
                .UseSystemd()
                .Build()
                .RunAsync();
        }
    }
}
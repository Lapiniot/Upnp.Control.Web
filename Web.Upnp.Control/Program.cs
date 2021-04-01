using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control.Services;

namespace Web.Upnp.Control
{
    public class Program
    {
        public static Task Main(string[] args)
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            return Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webHostBuilder => webHostBuilder
                    .ConfigureAppConfiguration((ctx, cb) => cb
                        .AddJsonFile($"appsettings.{ctx.HostingEnvironment.EnvironmentName}.Https.json", true)
                        .AddJsonFile($"appsettings.Secrets.json", true, true))
                    .UseStartup<Startup>()
                    .UseKestrel()
                    .UseSockets())
                .ConfigureServices(services => services.AddHostedService<UpnpDiscoveryService>())
                .UseWindowsService()
                .UseSystemd()
                .Build()
                .RunAsync();
        }
    }
}
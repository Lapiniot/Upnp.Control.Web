using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Web.Upnp.Control.Infrastructure.Middleware
{
    public class CertificateDownloadMiddleware : IMiddleware
    {
        private readonly IWebHostEnvironment environment;
        private readonly IConfiguration configuration;
        private readonly IServer server;

        public CertificateDownloadMiddleware(IWebHostEnvironment environment, IConfiguration configuration, IServer server)
        {
            this.environment = environment ?? throw new System.ArgumentNullException(nameof(environment));
            this.configuration = configuration ?? throw new System.ArgumentNullException(nameof(configuration));
            this.server = server ?? throw new System.ArgumentNullException(nameof(server));
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            context.Response.StatusCode = 404;
            await context.Response.CompleteAsync().ConfigureAwait(false);
        }
    }
}
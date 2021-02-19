using System;
using System.Buffers.Text;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using static System.Text.Encoding;

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
            var endpointsSection = configuration.GetSection("Kestrel:Endpoints");
            foreach(var ep in endpointsSection.GetChildren())
            {
                var url = ep["Url"];
                if(string.IsNullOrEmpty(url) || !url.StartsWith("https://", StringComparison.InvariantCultureIgnoreCase)) continue;

                var certSection = ep.GetSection("Certificate");
                if(certSection == null) continue;

                var path = certSection["Path"];
                if(string.IsNullOrEmpty(path)) continue;
                var fileinfo = environment.ContentRootFileProvider.GetFileInfo(path);
                if(!fileinfo.Exists) continue;

                string password = certSection["Password"];
                using(var cert = new X509Certificate2(fileinfo.PhysicalPath, password))
                {
                    await SendAsFileAsync(context.Response, cert, $"{context.Request.Host.Host}.crt").ConfigureAwait(false);
                    await context.Response.CompleteAsync().ConfigureAwait(false);
                    return;
                }
            }

            context.Response.StatusCode = 404;
            await context.Response.CompleteAsync().ConfigureAwait(false);
        }

        private static async Task SendAsFileAsync(HttpResponse response, X509Certificate2 certificate, string fileName)
        {
            var bytes = certificate.Export(X509ContentType.Cert);

            response.ContentType = "application/octet-stream";
            response.Headers.Add("Content-Disposition", $"attachment; filename=\"{fileName}\"");

            var writer = response.BodyWriter;
            var memory = writer.GetMemory(Base64.GetMaxEncodedToUtf8Length(bytes.Length) + 55);

            var total = ASCII.GetBytes("-----BEGIN CERTIFICATE-----\n", memory.Span);
            Base64.EncodeToUtf8(bytes, memory.Span[total..], out _, out var written);
            total += written;
            total += ASCII.GetBytes("\n-----END CERTIFICATE-----\n", memory.Span[total..]);
            writer.Advance(total);

            await writer.FlushAsync().ConfigureAwait(false);
        }
    }
}
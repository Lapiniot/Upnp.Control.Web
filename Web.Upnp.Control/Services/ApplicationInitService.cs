using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control.Configuration;
using Web.Upnp.Control.DataAccess;

namespace Web.Upnp.Control.Services
{
    public class ApplicationInitService : IHostedService
    {
        private readonly IServiceProvider services;
        private readonly IHostEnvironment environment;
        private readonly IConfiguration configuration;

        public ApplicationInitService(IServiceProvider services, IHostEnvironment environment, IConfiguration configuration)
        {
            this.services = services ?? throw new ArgumentNullException(nameof(services));
            this.environment = environment ?? throw new ArgumentNullException(nameof(environment));
            this.configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            string root = environment.ContentRootPath;

            Directory.CreateDirectory(Path.Combine(root, "data"));
            await InitializeDatabasesAsync(cancellationToken).ConfigureAwait(false);

            var configRoot = Path.Combine(root, "config");
            Directory.CreateDirectory(configRoot);
            await ConfigMigrations.EnsureVapidConfigExistsAsync(Path.Combine(configRoot, "appsettings.Secrets.json"), configuration).ConfigureAwait(false);
        }

        private async Task InitializeDatabasesAsync(CancellationToken cancellationToken)
        {
            using(var scope = services.CreateScope())
            {
                var serviceProvider = scope.ServiceProvider;
                var upnpDb = serviceProvider.GetRequiredService<UpnpDbContext>();
                await upnpDb.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);
                var pushDb = serviceProvider.GetRequiredService<PushSubscriptionDbContext>();
                await pushDb.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
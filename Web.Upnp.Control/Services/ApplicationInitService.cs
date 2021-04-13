using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Web.Upnp.Control.DataAccess;

namespace Web.Upnp.Control.Services
{
    public class ApplicationInitService : IHostedService
    {
        private readonly IServiceProvider services;

        public ApplicationInitService(IServiceProvider services)
        {
            this.services = services ?? throw new ArgumentNullException(nameof(services));
        }

        public async Task StartAsync(CancellationToken cancellationToken)
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
using Microsoft.EntityFrameworkCore.Diagnostics;
using OOs.Extensions.Hosting;
using Upnp.Control.DataAccess.Commands;
using Upnp.Control.DataAccess.Queries;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Configuration;

#pragma warning disable CA1034 // Nested types should not be visible
public static class ConfigureServicesExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddUpnpDeviceSqliteDatabase(string connectionString) => services
            .AddSqliteDatabase<UpnpDbContext>(connectionString,
                builder => builder.UseModel(CompiledModels.UpnpDbContextModel.Instance))
            .AddTransient<IQueryHandler<GetDeviceQuery, UpnpDevice>, GetDeviceQueryHandler>()
            .AddTransient<IQueryHandler<GetDeviceDescriptionQuery, DeviceDescription>, GetDeviceQueryHandler>()
            .AddTransient<IEnumerableQueryHandler<GetDevicesQuery, UpnpDevice>, GetDeviceQueryHandler>()
            .AddTransient<ICommandHandler<AddDeviceCommand>, AddDeviceCommandHandler>()
            .AddTransient<ICommandHandler<RemoveDeviceCommand>, RemoveDeviceCommandHandler>()
            .AddTransient<ICommandHandler<UpdateDeviceExpirationCommand>, UpdateDeviceExpirationCommandHandler>();

        public IServiceCollection AddPushSubscriptionSqliteDatabase(string connectionString) => services
            .AddSqliteDatabase<PushSubscriptionDbContext>(connectionString,
                builder => builder.UseModel(CompiledModels.PushSubscriptionDbContextModel.Instance))
            .AddTransient<IQueryHandler<PSGetQuery, PushNotificationSubscription>, PSGetQueryHandler>()
            .AddTransient<IEnumerableQueryHandler<PSEnumerateQuery, PushNotificationSubscription>, PSEnumerateQueryHandler>()
            .AddTransient<ICommandHandler<PSAddCommand>, PSAddCommandHandler>()
            .AddTransient<ICommandHandler<PSRemoveCommand>, PSRemoveCommandHandler>();

        public IServiceCollection AddSqliteDatabase<[DynamicallyAccessedMembers(PublicConstructors | NonPublicConstructors | PublicProperties)] TContext>(
            string connectionString, Action<DbContextOptionsBuilder> optionsAction = null)
            where TContext : DbContext => services
            .AddDbContext<TContext>(builder =>
            {
                builder
                    .UseSqlite(connectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))
                    .ConfigureWarnings(w => w.Ignore(CoreEventId.RowLimitingOperationWithoutOrderByWarning));
                optionsAction?.Invoke(builder);
            })
            .AddServiceInitializer<SqliteMigrateDbInitializer<TContext>>();
    }
}
using Microsoft.EntityFrameworkCore.Diagnostics;
using OOs.Extensions.Hosting;
using Upnp.Control.DataAccess.Commands;
using Upnp.Control.DataAccess.Queries;
using Upnp.Control.Extensions.DependencyInjection;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Configuration;

#pragma warning disable CA1034 // Nested types should not be visible
public static class ConfigureServicesExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddUpnpDeviceSqliteDatabase(string connectionString) => services
            .AddSqliteDatabase<UpnpDbContext>(connectionString
#if NET9_0
                , builder => builder.UseModel(CompiledModels.UpnpDbContextModel.Instance)
#endif
            )
            .AddQuery<GetDeviceQuery, UpnpDevice, GetDeviceQueryHandler>()
            .AddQuery<GetDeviceDescriptionQuery, DeviceDescription, GetDeviceQueryHandler>()
            .AddEnumerableQuery<GetDevicesQuery, UpnpDevice, GetDeviceQueryHandler>()
            .AddCommand<AddDeviceCommand, AddDeviceCommandHandler>()
            .AddCommand<RemoveDeviceCommand, RemoveDeviceCommandHandler>()
            .AddCommand<UpdateDeviceExpirationCommand, UpdateDeviceExpirationCommandHandler>();

        public IServiceCollection AddPushSubscriptionSqliteDatabase(string connectionString) => services
            .AddSqliteDatabase<PushSubscriptionDbContext>(connectionString
#if NET9_0
                , builder => builder.UseModel(CompiledModels.PushSubscriptionDbContextModel.Instance)
#endif
            )
            .AddQuery<PSGetQuery, PushNotificationSubscription, PSGetQueryHandler>()
            .AddEnumerableQuery<PSEnumerateQuery, PushNotificationSubscription, PSEnumerateQueryHandler>()
            .AddCommand<PSAddCommand, PSAddCommandHandler>()
            .AddCommand<PSRemoveCommand, PSRemoveCommandHandler>();

        public IServiceCollection AddSqliteDatabase<[DynamicallyAccessedMembers(All)] TContext>(
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
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Metadata;
using OOs.Extensions.Hosting;
using Upnp.Control.DataAccess.Commands;
using Upnp.Control.DataAccess.CompiledModels;
using Upnp.Control.DataAccess.Queries;
using Upnp.Control.Extensions.DependencyInjection;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddUpnpDeviceSqliteDatabase(this IServiceCollection services, string fileName) => services
        .AddSqliteDatabase<UpnpDbContext>(fileName, UpnpDbContextModel.Instance)
        .AddQuery<GetDeviceQuery, UpnpDevice, GetDeviceQueryHandler>()
        .AddQuery<GetDeviceDescriptionQuery, DeviceDescription, GetDeviceQueryHandler>()
        .AddEnumerableQuery<GetDevicesQuery, UpnpDevice, GetDeviceQueryHandler>()
        .AddCommand<AddDeviceCommand, AddDeviceCommandHandler>()
        .AddCommand<RemoveDeviceCommand, RemoveDeviceCommandHandler>()
        .AddCommand<UpdateDeviceExpirationCommand, UpdateDeviceExpirationCommandHandler>();

    public static IServiceCollection AddPushSubscriptionSqliteDatabase(this IServiceCollection services, string fileName) => services
        .AddSqliteDatabase<PushSubscriptionDbContext>(fileName, PushSubscriptionDbContextModel.Instance)
        .AddQuery<PSGetQuery, PushNotificationSubscription, PSGetQueryHandler>()
        .AddEnumerableQuery<PSEnumerateQuery, PushNotificationSubscription, PSEnumerateQueryHandler>()
        .AddCommand<PSAddCommand, PSAddCommandHandler>()
        .AddCommand<PSRemoveCommand, PSRemoveCommandHandler>();

    public static IServiceCollection AddSqliteDatabase<[DynamicallyAccessedMembers(PublicConstructors | NonPublicConstructors | PublicProperties)] TContext>(
        this IServiceCollection services, string fileName, IModel model)
        where TContext : DbContext => services
        .AddDbContext<TContext>(builder => builder.UseSqlite($"Data Source={fileName};", o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))
            .UseModel(model)
            .ConfigureWarnings(w => w.Ignore(CoreEventId.RowLimitingOperationWithoutOrderByWarning)))
        .AddServiceInitializer<SqliteMigrateDbInitializer<TContext>>();
}
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Metadata;
using Upnp.Control.DataAccess.Commands;
using Upnp.Control.DataAccess.CompiledModels;
using Upnp.Control.DataAccess.Queries;
using Upnp.Control.Models.PushNotifications;

namespace Upnp.Control.DataAccess.Configuration;

public static class ConfigureServicesExtensions
{
    public static IServiceCollection AddUpnpDeviceSqliteDatabase(this IServiceCollection services, string fileName) =>
        services.AddSqliteDatabase<UpnpDbContext>(fileName, UpnpDbContextModel.Instance)
            .AddTransient<IAsyncQueryHandler<GetDeviceQuery, UpnpDevice>, GetDeviceQueryHandler>()
            .AddTransient<IAsyncEnumerableQueryHandler<GetDevicesQuery, UpnpDevice>, GetDeviceQueryHandler>()
            .AddTransient<IAsyncCommandHandler<AddDeviceCommand>, AddDeviceCommandHandler>()
            .AddTransient<IAsyncCommandHandler<RemoveDeviceCommand>, RemoveDeviceCommandHandler>()
            .AddTransient<IAsyncCommandHandler<UpdateDeviceExpirationCommand>, UpdateDeviceExpirationCommandHandler>();

    public static IServiceCollection AddPushSubscriptionSqliteDatabase(this IServiceCollection services, string fileName) =>
        services.AddSqliteDatabase<PushSubscriptionDbContext>(fileName, PushSubscriptionDbContextModel.Instance)
            .AddTransient<IAsyncQueryHandler<PSGetQuery, PushNotificationSubscription>, PSGetQueryHandler>()
            .AddTransient<IAsyncEnumerableQueryHandler<PSEnumerateQuery, PushNotificationSubscription>, PSEnumerateQueryHandler>()
            .AddTransient<IAsyncCommandHandler<PSAddCommand>, PSAddCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PSRemoveCommand>, PSRemoveCommandHandler>();

    public static IServiceCollection AddSqliteDatabase<TContext>(this IServiceCollection services, string fileName, IModel model) where TContext : DbContext =>
        services.AddDbContext<TContext>(builder => builder.UseSqlite($"Data Source={fileName};",
                    o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))
                .UseModel(model)
                .ConfigureWarnings(w => w.Ignore(CoreEventId.RowLimitingOperationWithoutOrderByWarning)))
            .AddTransient<IServiceInitializer, SqliteMigrateDbInitializer<TContext>>();
}
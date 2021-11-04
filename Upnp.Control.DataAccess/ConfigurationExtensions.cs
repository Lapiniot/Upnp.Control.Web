using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.Extensions.DependencyInjection;
using Upnp.Control.DataAccess.CompiledModels;
using Upnp.Control.DataAccess.Repositories;
using Upnp.Control.Services;
using Upnp.Control.Services.PushNotifications;

namespace Upnp.Control.DataAccess;

public static class ConfigurationExtensions
{
    public static IServiceCollection AddUpnpDeviceSqliteDatabase(this IServiceCollection services, string fileName)
    {
        return services.AddSqliteDatabase<UpnpDbContext>(fileName, UpnpDbContextModel.Instance)
            .AddTransient<IUpnpDeviceRepository, UpnpDbRepository>();
    }

    public static IServiceCollection AddPushSubscriptionSqliteDatabase(this IServiceCollection services, string fileName)
    {
        return services.AddSqliteDatabase<PushSubscriptionDbContext>(fileName, PushSubscriptionDbContextModel.Instance)
            .AddTransient<IPushSubscriptionRepository, PushSubscriptionRepository>();
    }

    public static IServiceCollection AddSqliteDatabase<TContext>(this IServiceCollection services, string fileName, IModel model) where TContext : DbContext
    {
        return services.AddDbContext<TContext>(builder => builder.UseSqlite($"Data Source={fileName};",
                    o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))
                .UseModel(model)
                .ConfigureWarnings(w => w.Ignore(CoreEventId.RowLimitingOperationWithoutOrderByWarning)))
            .AddTransient<IServiceInitializer, SqliteMigrateDbInitializer<TContext>>();
    }
}
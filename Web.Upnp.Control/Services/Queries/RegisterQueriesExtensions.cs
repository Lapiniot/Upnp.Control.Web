using Upnp.Control.Models;
using Upnp.Control.Models.PushNotifications;
using Upnp.Control.Services;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.Services.Queries;

public static class RegisterQueriesExtensions
{
    public static IServiceCollection AddQueryServices(this IServiceCollection services)
    {
        return services
            .AddTransient<IAsyncQueryHandler<AVGetStateQuery, AVState>, AVGetStateQueryHandler>()
            .AddTransient<IAsyncQueryHandler<AVGetPositionQuery, AVPosition>, AVGetPositionQueryHandler>()
            .AddTransient<IAsyncQueryHandler<AVGetPlayModeQuery, string>, AVGetPlayModeQueryHandler>()
            .AddTransient<IAsyncQueryHandler<RCGetVolumeQuery, RCVolumeState>, RCGetVolumeQueryHandler>()
            .AddTransient<IAsyncQueryHandler<RCGetMuteQuery, bool?>, RCGetMuteQueryHandler>()
            .AddTransient<IAsyncQueryHandler<SysPropsGetPlaylistStateQuery, string>, SysPropsGetPlaylistStateQueryHandler>()
            .AddTransient<IAsyncQueryHandler<GetDeviceQuery, UpnpDevice>, GetDeviceQueryHandler>()
            .AddTransient<IAsyncQueryHandler<CDGetContentQuery, CDContent>, GetContentQueryHandler>()
            .AddTransient<IAsyncEnumerableQueryHandler<GetDevicesQuery, UpnpDevice>, GetDeviceQueryHandler>()
            .AddTransient<IAsyncQueryHandler<CMGetProtocolInfoQuery, CMProtocolInfo>, CMGetProtocolInfoQueryHandler>()
            .AddTransient<IAsyncQueryHandler<CMGetConnectionsQuery, IEnumerable<string>>, CMGetConnectionsQueryHandler>()
            .AddTransient<IAsyncQueryHandler<CMGetConnectionInfoQuery, CMConnectionInfo>, CMGetConnectionInfoQueryHandler>()
            .AddTransient<IAsyncQueryHandler<PSGetServerKeyQuery, byte[]>, PSGetServerKeyQueryHandler>();
    }
}
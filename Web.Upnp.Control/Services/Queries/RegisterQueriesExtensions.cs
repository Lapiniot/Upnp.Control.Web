using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Queries
{
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
                .AddTransient<IAsyncQueryHandler<GetDeviceQuery, Device>, GetDeviceQueryHandler>()
                .AddTransient<IAsyncQueryHandler<CDGetContentQuery, ContentResult>, GetContentQueryHandler>()
                .AddTransient<IAsyncEnumerableQueryHandler<GetDevicesQuery, Device>, GetDeviceQueryHandler>()
                .AddTransient<IAsyncQueryHandler<CMGetProtocolInfoQuery, CMProtocolInfo>, CMGetProtocolInfoQueryHandler>()
                .AddTransient<IAsyncQueryHandler<CMGetConnectionsQuery, IEnumerable<string>>, CMGetConnectionsQueryHandler>()
                .AddTransient<IAsyncQueryHandler<CMGetConnectionInfoQuery, CMConnectionInfo>, CMGetConnectionInfoQueryHandler>();
        }
    }
}
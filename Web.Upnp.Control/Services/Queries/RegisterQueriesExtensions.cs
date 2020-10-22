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
                .AddTransient<IAsyncQuery<AVGetStateQueryParams, AVState>, AVGetStateQuery>()
                .AddTransient<IAsyncQuery<AVGetPositionQueryParams, AVPosition>, AVGetPositionQuery>()
                .AddTransient<IAsyncQuery<AVGetPlayModeQueryParams, string>, AVGetPlayModeQuery>()
                .AddTransient<IAsyncQuery<RCGetVolumeQueryParams, RCVolumeState>, RCGetVolumeQuery>()
                .AddTransient<IAsyncQuery<RCGetMuteQueryParams, bool?>, RCGetMuteQuery>()
                .AddTransient<IAsyncQuery<SysPropsGetPlaylistStateQueryParams, string>, SysPropsGetPlaylistStateQuery>()
                .AddTransient<IAsyncQuery<GetDeviceQueryParams, Device>, GetDeviceQuery>()
                .AddTransient<IAsyncQuery<GetContentQueryParams, GetContentResult>, GetContentQuery>()
                .AddTransient<IAsyncEnumerableQuery<GetDevicesQueryParams, Device>, GetDeviceQuery>();
        }
    }
}
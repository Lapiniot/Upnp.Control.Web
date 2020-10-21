using Microsoft.Extensions.DependencyInjection;
using Web.Upnp.Control.Models;
using Web.Upnp.Control.Services.Abstractions;

namespace Web.Upnp.Control.Services.Commands
{
    public static class RegisterCommandsExtensions
    {
        public static IServiceCollection AddCommandServices(this IServiceCollection services)
        {
            return services
                .AddTransient<IAsyncCommand<AVSetStateCommandParams>, AVSetStateCommand>()
                .AddTransient<IAsyncCommand<AVSetPositionCommandParams>, AVSetPositionCommand>()
                .AddTransient<IAsyncCommand<AVSetPlayModeCommandParams>, AVSetPlayModeCommand>()
                .AddTransient<IAsyncCommand<RCSetVolumeCommandParams>, RCSetVolumeCommand>()
                .AddTransient<IAsyncCommand<RCSetMuteCommandParams>, RCSetMuteCommand>();
        }
    }
}
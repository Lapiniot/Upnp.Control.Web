using Upnp.Control.Services;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.Services.Commands;

public static class RegisterCommandsExtensions
{
    public static IServiceCollection AddCommandServices(this IServiceCollection services)
    {
        return services
            .AddTransient<IAsyncCommandHandler<AVSetStateCommand>, AVSetStateCommandHandler>()
            .AddTransient<IAsyncCommandHandler<AVSetPositionCommand>, AVSetPositionCommandHandler>()
            .AddTransient<IAsyncCommandHandler<AVSetPlayModeCommand>, AVSetPlayModeCommandHandler>()
            .AddTransient<IAsyncCommandHandler<RCSetVolumeCommand>, RCSetVolumeCommandHandler>()
            .AddTransient<IAsyncCommandHandler<RCSetMuteCommand>, RCSetMuteCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLCreateCommand>, PLCreateCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLCreateFromItemsCommand>, PLCreateFromItemsCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLCreateFromFilesCommand>, PLCreateFromFilesCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLRenameCommand>, PLRenameCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLCopyCommand>, PLCopyCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLRemoveCommand>, PLRemoveCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLAddItemsCommand>, PLAddItemsCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLAddPlaylistFilesCommand>, PLAddFeedsCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLAddFeedUrlCommand>, PLAddFeedsCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLRemoveItemsCommand>, PLRemoveItemsCommandHandler>()
            .AddTransient<IAsyncCommandHandler<QAddItemsCommand>, QueueAddItemsCommandHandler>()
            .AddTransient<IAsyncCommandHandler<QClearCommand>, QueueClearCommandHandler>();
    }
}
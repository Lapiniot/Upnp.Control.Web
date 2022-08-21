namespace Upnp.Control.Services.Commands.Configuration;

public static class RegisterCommandsExtensions
{
    public static IServiceCollection AddCommands(this IServiceCollection services) =>
        services
            .AddAVTransportCommands()
            .AddRenderingControlCommands()
            .AddPlaylistCommands()
            .AddQueueCommands();

    public static IServiceCollection AddAVTransportCommands(this IServiceCollection services) =>
        services
            .AddTransient<IAsyncCommandHandler<AVSetStateCommand>, AVSetStateCommandHandler>()
            .AddTransient<IAsyncCommandHandler<AVSetPositionCommand>, AVSetPositionCommandHandler>()
            .AddTransient<IAsyncCommandHandler<AVSetPlayModeCommand>, AVSetPlayModeCommandHandler>();

    public static IServiceCollection AddRenderingControlCommands(this IServiceCollection services) =>
        services
            .AddTransient<IAsyncCommandHandler<RCSetVolumeCommand>, RCSetVolumeCommandHandler>()
            .AddTransient<IAsyncCommandHandler<RCSetMuteCommand>, RCSetMuteCommandHandler>();

    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode", Justification = "Preserved manually.")]
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(PlaylistOptions))]
    public static IServiceCollection AddPlaylistCommands(this IServiceCollection services)
    {
        services.AddOptions<PlaylistOptions>().BindConfiguration("Playlists");

        return services
            .AddTransient<IAsyncCommandHandler<PLCreateCommand>, PLCreateCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLCreateFromItemsCommand>, PLCreateFromItemsCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLCreateFromFilesCommand>, PLCreateFromFilesCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLRenameCommand>, PLRenameCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLCopyCommand>, PLCopyCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLRemoveCommand>, PLRemoveCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLAddItemsCommand>, PLAddItemsCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLAddPlaylistFilesCommand>, PLAddFeedsCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLAddFeedUrlCommand>, PLAddFeedsCommandHandler>()
            .AddTransient<IAsyncCommandHandler<PLRemoveItemsCommand>, PLRemoveItemsCommandHandler>();
    }

    public static IServiceCollection AddQueueCommands(this IServiceCollection services) =>
        services
            .AddTransient<IAsyncCommandHandler<QAddItemsCommand>, QueueAddItemsCommandHandler>()
            .AddTransient<IAsyncCommandHandler<QClearCommand>, QueueClearCommandHandler>();
}
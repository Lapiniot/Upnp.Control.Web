namespace Upnp.Control.Services.Commands.Configuration;

public static class RegisterCommandsExtensions
{
    public static IServiceCollection AddCommands(this IServiceCollection services) => services
        .AddAVTransportCommands()
        .AddRenderingControlCommands()
        .AddPlaylistCommands()
        .AddQueueCommands();

    public static IServiceCollection AddAVTransportCommands(this IServiceCollection services) => services
        .AddCommand<AVSetStateCommand, AVSetStateCommandHandler>()
        .AddCommand<AVSetPositionCommand, AVSetPositionCommandHandler>()
        .AddCommand<AVSetPlayModeCommand, AVSetPlayModeCommandHandler>();

    public static IServiceCollection AddRenderingControlCommands(this IServiceCollection services) => services
        .AddCommand<RCSetVolumeCommand, RCSetVolumeCommandHandler>()
        .AddCommand<RCSetMuteCommand, RCSetMuteCommandHandler>();

    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode", Justification = "Preserved manually.")]
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(PlaylistOptions))]
    public static IServiceCollection AddPlaylistCommands(this IServiceCollection services)
    {
        services.AddOptions<PlaylistOptions>().BindConfiguration("Playlists");

        return services
            .AddCommand<PLCreateCommand, PLCreateCommandHandler>()
            .AddCommand<PLCreateFromItemsCommand, PLCreateFromItemsCommandHandler>()
            .AddCommand<PLCreateFromFilesCommand, PLCreateFromFilesCommandHandler>()
            .AddCommand<PLRenameCommand, PLRenameCommandHandler>()
            .AddCommand<PLCopyCommand, PLCopyCommandHandler>()
            .AddCommand<PLRemoveCommand, PLRemoveCommandHandler>()
            .AddCommand<PLAddItemsCommand, PLAddItemsCommandHandler>()
            .AddCommand<PLAddPlaylistFilesCommand, PLAddFeedsCommandHandler>()
            .AddCommand<PLAddFeedUrlCommand, PLAddFeedsCommandHandler>()
            .AddCommand<PLRemoveItemsCommand, PLRemoveItemsCommandHandler>();
    }

    public static IServiceCollection AddQueueCommands(this IServiceCollection services) => services
        .AddCommand<QAddItemsCommand, QueueAddItemsCommandHandler>()
        .AddCommand<QClearCommand, QueueClearCommandHandler>();
}
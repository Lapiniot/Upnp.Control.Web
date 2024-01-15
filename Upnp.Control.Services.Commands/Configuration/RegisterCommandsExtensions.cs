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

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(PlaylistOptions))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static IServiceCollection AddPlaylistCommands(this IServiceCollection services)
    {
        services.AddTransient<IValidateOptions<PlaylistOptions>, PlaylistOptionsValidator>();
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
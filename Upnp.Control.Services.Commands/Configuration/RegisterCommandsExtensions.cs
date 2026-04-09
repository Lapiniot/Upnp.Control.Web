namespace Upnp.Control.Services.Commands.Configuration;

public static class RegisterCommandsExtensions
{
    public static IServiceCollection AddCommands(this IServiceCollection services) => services
        .AddAVTransportCommands()
        .AddRenderingControlCommands()
        .AddPlaylistCommands()
        .AddQueueCommands();

    public static IServiceCollection AddAVTransportCommands(this IServiceCollection services) => services
        .AddTransient<ICommandHandler<AVSetStateCommand>, AVSetStateCommandHandler>()
        .AddTransient<ICommandHandler<AVSetPositionCommand>, AVSetPositionCommandHandler>()
        .AddTransient<ICommandHandler<AVSetPlayModeCommand>, AVSetPlayModeCommandHandler>();

    public static IServiceCollection AddRenderingControlCommands(this IServiceCollection services) => services
        .AddTransient<ICommandHandler<RCSetVolumeCommand>, RCSetVolumeCommandHandler>()
        .AddTransient<ICommandHandler<RCSetMuteCommand>, RCSetMuteCommandHandler>();

    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(PlaylistOptions))]
    [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
    public static IServiceCollection AddPlaylistCommands(this IServiceCollection services)
    {
        services.AddTransient<IValidateOptions<PlaylistOptions>, PlaylistOptionsValidator>();
        services.AddOptions<PlaylistOptions>().BindConfiguration("Playlists");

        return services
            .AddTransient<ICommandHandler<PLCreateCommand>, PLCreateCommandHandler>()
            .AddTransient<ICommandHandler<PLCreateFromItemsCommand>, PLCreateFromItemsCommandHandler>()
            .AddTransient<ICommandHandler<PLCreateFromFilesCommand>, PLCreateFromFilesCommandHandler>()
            .AddTransient<ICommandHandler<PLRenameCommand>, PLRenameCommandHandler>()
            .AddTransient<ICommandHandler<PLCopyCommand>, PLCopyCommandHandler>()
            .AddTransient<ICommandHandler<PLRemoveCommand>, PLRemoveCommandHandler>()
            .AddTransient<ICommandHandler<PLAddItemsCommand>, PLAddItemsCommandHandler>()
            .AddTransient<ICommandHandler<PLAddPlaylistFilesCommand>, PLAddFeedsCommandHandler>()
            .AddTransient<ICommandHandler<PLAddFeedUrlCommand>, PLAddFeedsCommandHandler>()
            .AddTransient<ICommandHandler<PLRemoveItemsCommand>, PLRemoveItemsCommandHandler>();
    }

    public static IServiceCollection AddQueueCommands(this IServiceCollection services) => services
        .AddTransient<ICommandHandler<QAddItemsCommand>, QueueAddItemsCommandHandler>()
        .AddTransient<ICommandHandler<QClearCommand>, QueueClearCommandHandler>();
}
namespace Upnp.Control.Services.Commands;

public static class RegisterCommandsExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddCommands() => services
        .AddAVTransportCommands()
        .AddRenderingControlCommands()
        .AddPlaylistCommands()
        .AddQueueCommands();

        public IServiceCollection AddAVTransportCommands() => services
            .AddTransient<ICommandHandler<AVSetStateCommand>, AVSetStateCommandHandler>()
            .AddTransient<ICommandHandler<AVSetPositionCommand>, AVSetPositionCommandHandler>()
            .AddTransient<ICommandHandler<AVSetPlayModeCommand>, AVSetPlayModeCommandHandler>();

        public IServiceCollection AddRenderingControlCommands() => services
            .AddTransient<ICommandHandler<RCSetVolumeCommand>, RCSetVolumeCommandHandler>()
            .AddTransient<ICommandHandler<RCSetMuteCommand>, RCSetMuteCommandHandler>();

        [DynamicDependency(DynamicallyAccessedMemberTypes.PublicConstructors, typeof(PlaylistOptions))]
        [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "Preserved manually")]
        public IServiceCollection AddPlaylistCommands()
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

        public IServiceCollection AddQueueCommands() => services
            .AddTransient<ICommandHandler<QAddItemsCommand>, QueueAddItemsCommandHandler>()
            .AddTransient<ICommandHandler<QClearCommand>, QueueClearCommandHandler>();
    }
}
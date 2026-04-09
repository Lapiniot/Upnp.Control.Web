namespace Upnp.Control.Services.Queries;

public static class RegisterQueriesExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddQueries() => services
        .AddAVTransportQueries()
        .AddRenderingControlQueries()
        .AddSystemPropertiesQueries()
        .AddContentDirectoryQueries()
        .AddConnectionManagerQueries();

        public IServiceCollection AddAVTransportQueries() => services
            .AddTransient<IQueryHandler<AVGetStateQuery, AVState>, AVGetStateQueryHandler>()
            .AddTransient<IQueryHandler<AVGetPositionQuery, AVPosition>, AVGetPositionQueryHandler>()
            .AddTransient<IQueryHandler<AVGetPlayModeQuery, string>, AVGetPlayModeQueryHandler>();

        public IServiceCollection AddRenderingControlQueries() => services
            .AddTransient<IQueryHandler<RCGetVolumeQuery, RCVolumeState>, RCGetVolumeQueryHandler>()
            .AddTransient<IQueryHandler<RCGetMuteQuery, bool?>, RCGetMuteQueryHandler>();

        public IServiceCollection AddSystemPropertiesQueries() => services
            .AddTransient<IQueryHandler<SysPropsGetPlaylistStateQuery, string>, SysPropsGetPlaylistStateQueryHandler>();

        public IServiceCollection AddContentDirectoryQueries() => services
            .AddTransient<IQueryHandler<CDGetContentQuery, CDContent>, GetContentQueryHandler>()
            .AddTransient<IQueryHandler<CDSearchContentQuery, CDContent>, GetContentQueryHandler>()
            .AddTransient<IQueryHandler<CDSearchCapabilitiesQuery, string[]>, GetSearchCapabilitiesQueryHandler>();

        public IServiceCollection AddConnectionManagerQueries() => services
            .AddTransient<IQueryHandler<CMGetProtocolInfoQuery, CMProtocolInfo>, CMGetProtocolInfoQueryHandler>()
            .AddTransient<IQueryHandler<CMGetConnectionsQuery, IEnumerable<string>>, CMGetConnectionsQueryHandler>()
            .AddTransient<IQueryHandler<CMGetConnectionInfoQuery, CMConnectionInfo>, CMGetConnectionInfoQueryHandler>();
    }
}
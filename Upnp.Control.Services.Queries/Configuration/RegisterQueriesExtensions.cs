namespace Upnp.Control.Services.Queries.Configuration;

public static class RegisterQueriesExtensions
{
    public static IServiceCollection AddQueries(this IServiceCollection services) => services
        .AddAVTransportQueries()
        .AddRenderingControlQueries()
        .AddSystemPropertiesQueries()
        .AddContentDirectoryQueries()
        .AddConnectionManagerQueries();

    public static IServiceCollection AddAVTransportQueries(this IServiceCollection services) => services
        .AddTransient<IQueryHandler<AVGetStateQuery, AVState>, AVGetStateQueryHandler>()
        .AddTransient<IQueryHandler<AVGetPositionQuery, AVPosition>, AVGetPositionQueryHandler>()
        .AddTransient<IQueryHandler<AVGetPlayModeQuery, string>, AVGetPlayModeQueryHandler>();

    public static IServiceCollection AddRenderingControlQueries(this IServiceCollection services) => services
        .AddTransient<IQueryHandler<RCGetVolumeQuery, RCVolumeState>, RCGetVolumeQueryHandler>()
        .AddTransient<IQueryHandler<RCGetMuteQuery, bool?>, RCGetMuteQueryHandler>();

    public static IServiceCollection AddSystemPropertiesQueries(this IServiceCollection services) => services
        .AddTransient<IQueryHandler<SysPropsGetPlaylistStateQuery, string>, SysPropsGetPlaylistStateQueryHandler>();

    public static IServiceCollection AddContentDirectoryQueries(this IServiceCollection services) => services
        .AddTransient<IQueryHandler<CDGetContentQuery, CDContent>, GetContentQueryHandler>()
        .AddTransient<IQueryHandler<CDSearchContentQuery, CDContent>, GetContentQueryHandler>()
        .AddTransient<IQueryHandler<CDSearchCapabilitiesQuery, string[]>, GetSearchCapabilitiesQueryHandler>();

    public static IServiceCollection AddConnectionManagerQueries(this IServiceCollection services) => services
        .AddTransient<IQueryHandler<CMGetProtocolInfoQuery, CMProtocolInfo>, CMGetProtocolInfoQueryHandler>()
        .AddTransient<IQueryHandler<CMGetConnectionsQuery, IEnumerable<string>>, CMGetConnectionsQueryHandler>()
        .AddTransient<IQueryHandler<CMGetConnectionInfoQuery, CMConnectionInfo>, CMGetConnectionInfoQueryHandler>();
}
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
        .AddQuery<AVGetStateQuery, AVState, AVGetStateQueryHandler>()
        .AddQuery<AVGetPositionQuery, AVPosition, AVGetPositionQueryHandler>()
        .AddQuery<AVGetPlayModeQuery, string, AVGetPlayModeQueryHandler>();

    public static IServiceCollection AddRenderingControlQueries(this IServiceCollection services) => services
        .AddQuery<RCGetVolumeQuery, RCVolumeState, RCGetVolumeQueryHandler>()
        .AddQuery<RCGetMuteQuery, bool?, RCGetMuteQueryHandler>();

    public static IServiceCollection AddSystemPropertiesQueries(this IServiceCollection services) => services
        .AddQuery<SysPropsGetPlaylistStateQuery, string, SysPropsGetPlaylistStateQueryHandler>();

    public static IServiceCollection AddContentDirectoryQueries(this IServiceCollection services) => services
        .AddQuery<CDGetContentQuery, CDContent, GetContentQueryHandler>()
        .AddQuery<CDSearchContentQuery, CDContent, GetContentQueryHandler>();

    public static IServiceCollection AddConnectionManagerQueries(this IServiceCollection services) => services
        .AddQuery<CMGetProtocolInfoQuery, CMProtocolInfo, CMGetProtocolInfoQueryHandler>()
        .AddQuery<CMGetConnectionsQuery, IEnumerable<string>, CMGetConnectionsQueryHandler>()
        .AddQuery<CMGetConnectionInfoQuery, CMConnectionInfo, CMGetConnectionInfoQueryHandler>();
}
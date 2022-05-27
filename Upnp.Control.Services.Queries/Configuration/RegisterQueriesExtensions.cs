namespace Upnp.Control.Services.Queries.Configuration;

public static class RegisterQueriesExtensions
{
    public static IServiceCollection AddQueries(this IServiceCollection services) =>
        services
            .AddAVTransportQueries()
            .AddRenderingControlQueries()
            .AddSystemPropertiesQueries()
            .AddContentDirectoryQueries()
            .AddConnectionManagerQueries();

    public static IServiceCollection AddAVTransportQueries(this IServiceCollection services) =>
        services
            .AddTransient<IAsyncQueryHandler<AVGetStateQuery, AVState>, AVGetStateQueryHandler>()
            .AddTransient<IAsyncQueryHandler<AVGetPositionQuery, AVPosition>, AVGetPositionQueryHandler>()
            .AddTransient<IAsyncQueryHandler<AVGetPlayModeQuery, string>, AVGetPlayModeQueryHandler>();

    public static IServiceCollection AddRenderingControlQueries(this IServiceCollection services) =>
        services
            .AddTransient<IAsyncQueryHandler<RCGetVolumeQuery, RCVolumeState>, RCGetVolumeQueryHandler>()
            .AddTransient<IAsyncQueryHandler<RCGetMuteQuery, bool?>, RCGetMuteQueryHandler>();

    public static IServiceCollection AddSystemPropertiesQueries(this IServiceCollection services) =>
        services.AddTransient<IAsyncQueryHandler<SysPropsGetPlaylistStateQuery, string>, SysPropsGetPlaylistStateQueryHandler>();

    public static IServiceCollection AddContentDirectoryQueries(this IServiceCollection services) =>
        services.AddTransient<IAsyncQueryHandler<CDGetContentQuery, CDContent>, GetContentQueryHandler>();

    public static IServiceCollection AddConnectionManagerQueries(this IServiceCollection services) =>
        services
            .AddTransient<IAsyncQueryHandler<CMGetProtocolInfoQuery, CMProtocolInfo>, CMGetProtocolInfoQueryHandler>()
            .AddTransient<IAsyncQueryHandler<CMGetConnectionsQuery, IEnumerable<string>>, CMGetConnectionsQueryHandler>()
            .AddTransient<IAsyncQueryHandler<CMGetConnectionInfoQuery, CMConnectionInfo>, CMGetConnectionInfoQueryHandler>();
}
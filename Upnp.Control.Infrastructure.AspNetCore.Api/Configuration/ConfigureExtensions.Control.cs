namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds Playback Control API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include 'deviceId' and 'queueId' route parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    [UnconditionalSuppressMessage("AssemblyLoadTrimming", "IL2026:RequiresUnreferencedCode", Justification = "Preserved manually.")]
    [DynamicDependency(DynamicallyAccessedMemberTypes.PublicMethods, typeof(ControlServices))]
    public static RouteGroupBuilder MapControlApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var group = routeBuilder.MapGroup(pattern).WithTags("Playback Control");

        group.MapGet("state", ControlServices.GetStateAsync);

        group.MapPut("state", ControlServices.SetStateAsync);

        group.MapGet("position", ControlServices.GetPositionAsync);

        group.MapPut("position", ControlServices.SeekAsync);

        group.MapGet("play-mode", ControlServices.GetPlayModeAsync);

        group.MapPut("play-mode", ControlServices.SetPlayModeAsync);

        group.MapGet("volume", ControlServices.GetVolumeAsync);

        group.MapPut("volume", ControlServices.SetVolumeAsync);

        group.MapGet("mute", ControlServices.GetMuteAsync);

        group.MapPut("mute", ControlServices.SetMuteAsync);

        return group;
    }
}
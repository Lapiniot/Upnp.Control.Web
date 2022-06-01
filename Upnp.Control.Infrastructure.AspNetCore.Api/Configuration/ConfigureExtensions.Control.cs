namespace Upnp.Control.Infrastructure.AspNetCore.Api.Configuration;

public static partial class ConfigureExtensions
{
    /// <summary>
    /// Adds Playback Control API <see cref="RouteEndpoint" /> endpoints to the <see cref="IEndpointRouteBuilder" />
    /// </summary>
    /// <param name="routeBuilder">The <see cref="IEndpointRouteBuilder" /> to add the route to.</param>
    /// <param name="pattern">The route pattern. May include 'deviceId' and 'queueId' route parameters.</param>
    /// <returns>The <see cref="RouteGroupBuilder" /> that can be used to further customize the builder.</returns>
    public static RouteGroupBuilder MapControlApi(this IEndpointRouteBuilder routeBuilder, string pattern)
    {
        var tags = new[] { "Playback Control" };

        var group = routeBuilder.MapGroup(pattern);

        group.MapGet("state", ControlServices.GetStateAsync)
            .Produces<AVState>(contentType: "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPut("state", ControlServices.SetStateAsync)
            .Accepts<AVStateParams>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapGet("position", ControlServices.GetPositionAsync)
            .Produces<AVPosition>(contentType: "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPut("position", ControlServices.SeekAsync)
            .Accepts<AVPositionParams>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapGet("play-mode", ControlServices.GetPlayModeAsync)
            .Produces<string>(contentType: "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPut("play-mode", ControlServices.SetPlayModeAsync)
            .Accepts<string>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapGet("volume", ControlServices.GetVolumeAsync)
            .Produces<RCVolumeState>(contentType: "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPut("volume", ControlServices.SetVolumeAsync)
            .Accepts<uint>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapGet("mute", ControlServices.GetMuteAsync)
            .Produces<bool?>(contentType: "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        group.MapPut("mute", ControlServices.SetMuteAsync)
            .Accepts<bool>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithTags(tags);

        return group;
    }
}
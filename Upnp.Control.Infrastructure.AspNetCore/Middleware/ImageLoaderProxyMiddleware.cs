using Microsoft.Net.Http.Headers;

namespace Upnp.Control.Infrastructure.AspNetCore.Middleware;

public sealed class ImageLoaderProxyMiddleware : ProxyMiddleware
{
    private readonly IOptions<Configuration.ImageProxyOptions> options;

    public ImageLoaderProxyMiddleware(ImageLoaderProxyClient client, IOptions<Configuration.ImageProxyOptions> options, ILogger<ImageLoaderProxyMiddleware> logger)
        : base(client.Client, logger)
    {
        ArgumentNullException.ThrowIfNull(options);

        this.options = options;
        BufferSize = options.Value.BufferSize;
    }

    protected override void CopyHeaders(HttpResponseMessage responseMessage, HttpContext context)
    {
        if (responseMessage.Content is not { } content)
        {
            throw new InvalidDataException("Empty response content was not expected");
        }

        if (content is not { Headers.ContentType.MediaType: { } mediaType })
        {
            throw new InvalidDataException("Response content-type is unknown");
        }

        if (!mediaType.StartsWith("image/", StringComparison.InvariantCulture))
        {
            throw new InvalidDataException("Invalid data. Content of type image/* was expected.");
        }

        base.CopyHeaders(responseMessage, context);

        if (options.Value.CacheControl is { Length: > 0 } cacheControl)
        {
            context.Response.Headers[HeaderNames.CacheControl] = cacheControl;
        }

        if (options.Value.VaryBy is { Length: > 0 } varyBy)
        {
            context.Response.Headers[HeaderNames.Vary] = varyBy;
        }
    }
}
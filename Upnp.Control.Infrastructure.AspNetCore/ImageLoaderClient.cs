namespace Upnp.Control.Infrastructure.AspNetCore;

public class ImageLoaderProxyClient
{
    private readonly HttpClient client;

    public ImageLoaderProxyClient(HttpClient client)
    {
        ArgumentNullException.ThrowIfNull(client);

        this.client = client;
    }

    public HttpClient Client => client;
}
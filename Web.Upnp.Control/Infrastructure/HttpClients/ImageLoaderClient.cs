namespace Web.Upnp.Control.Infrastructure.HttpClients;

public class ImageLoaderProxyClient
{
    private readonly HttpClient client;

    public ImageLoaderProxyClient(HttpClient client)
    {
        this.client = client ?? throw new ArgumentNullException(nameof(client));
    }

    public HttpClient Client => client;
}
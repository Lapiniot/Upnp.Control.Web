namespace Web.Upnp.Control.Infrastructure.HttpClients;

public class HttpSoapClient
{
    public HttpSoapClient(HttpClient client)
    {
        ArgumentNullException.ThrowIfNull(client);

        Client = client;
        Client.DefaultRequestHeaders.Add("Accept-Encoding", "gzip,deflate");
        Client.DefaultRequestVersion = new Version(1, 1);
    }

    public HttpClient Client { get; }
}
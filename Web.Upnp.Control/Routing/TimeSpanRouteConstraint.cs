using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Web.Upnp.Control.Routing
{
    internal class TimeSpanRouteConstraint : IRouteConstraint
    {
        public bool Match(HttpContext httpContext, IRouter route, string routeKey, RouteValueDictionary values, RouteDirection routeDirection)
        {
            return values.TryGetValue(routeKey, out var value) && value is not null && TimeSpan.TryParse(value.ToString(), out _);
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Web.Upnp.Control.Infrastructure;

internal sealed class RequestCancelledExceptionFilterAttribute : ExceptionFilterAttribute
{
    #region Overrides of ExceptionFilterAttribute

    public override void OnException(ExceptionContext context)
    {
        if(context.Exception is not OperationCanceledException) return;
        var logger = context.HttpContext.RequestServices.GetService<ILogger<RequestCancelledExceptionFilterAttribute>>();
        logger.LogWarning("Request cancelled by client");
        context.ExceptionHandled = true;
        context.Result = new StatusCodeResult(499);
    }

    #endregion
}
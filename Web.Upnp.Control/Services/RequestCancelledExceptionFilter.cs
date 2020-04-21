using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace Web.Upnp.Control.Services
{
    public class RequestCancelledExceptionFilter : ExceptionFilterAttribute
    {
        private readonly ILogger logger;

        public RequestCancelledExceptionFilter(ILoggerFactory loggerFactory)
        {
            logger = loggerFactory.CreateLogger<RequestCancelledExceptionFilter>();
        }

        #region Overrides of ExceptionFilterAttribute

        public override void OnException(ExceptionContext context)
        {
            if(!(context.Exception is OperationCanceledException)) return;

            logger.LogWarning("Request cancelled by client");
            context.ExceptionHandled = true;
            context.Result = new StatusCodeResult(499);
        }

        #endregion
    }
}
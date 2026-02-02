using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace Figura.Restore.API.Middleware
{
    //this class catches exceptions during the request - response server operations 
    //handles them, adopt to json - and sends back
    //the program.cs middleware has to be updated to make it workable
    public class ExceptionMiddleware(IHostEnvironment env, ILogger<ExceptionMiddleware> logger) : IMiddleware
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);
            }
            //in case of exception our middleware will catch it and perform custom operations on it
            catch (Exception ex)
            {
                await HandleException(context, ex);
            }
        }

        private async Task HandleException(HttpContext context, Exception ex)
        {
            logger.LogError(ex, ex.Message);
            //we want to send back a json text based on exception
            //the content type has to be updated as not all api endpoints sends just jsons
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            //response
            var response = new ProblemDetails
            {
                Status = 500,
                Detail = env.IsDevelopment() ? ex.StackTrace?.ToString() : null,
                Title = ex.Message
            };

            //as this is going to be the 'application/json' we have to serialize it
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

            var json = JsonSerializer.Serialize(response, options);

            //send back
            await context.Response.WriteAsync(json);
        }
    }
}

using Figura.Restore.API.RequestHelpers;
using Microsoft.Net.Http.Headers;
using System.Text.Json;

namespace Figura.Restore.API.Extensions
{
    public static class HttpExtensions
    {
        public static void AddPaginationHeader(this HttpResponse response, PaginationMetadata metadata)
        {
            //we are dealing with response - that is JSON based => we have to update the content as JSON
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            response.Headers.Append("Pagination", JsonSerializer.Serialize(metadata, options));
            //this is a custom header that is not a standard one => we have to handle cors
            //we will not be able to access the headers content on the client without it
            response.Headers.Append(HeaderNames.AccessControlExposeHeaders, "Pagination");
        }
    }
}

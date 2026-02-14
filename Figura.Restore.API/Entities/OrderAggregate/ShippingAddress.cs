using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace Figura.Restore.API.Entities.OrderAggregate
{
    //part of the order table -> its going to be inline within order
    //shipping address will not have its own table in DB
    [Owned] //owned does not need an id
    public class ShippingAddress
    {
        public required string Name { get; set; }
        public required string Line1 { get; set; }
        public string? Line2 { get; set; }
        public required string City { get; set; }
        public required string State { get; set; }

        [JsonPropertyName("postal_code")]
        public required string PostalCode { get; set; }
        public required string Country { get; set; }
    }
}

using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace Figura.Restore.API.Entities.OrderAggregate
{
    [Owned] //no id -> no db table -> part of the order
    //Json properties - exp_month and exp_year comes from stripe transaction response parameter
    //we could either update it on the client (naming) or just adopt it by JsonPropertyName
    public class PaymentSummary
    {
        //cc details
        public int Last4 { get; set; }
        public required string Brand { get; set; }
        [JsonPropertyName("exp_month")]
        public int ExpMonth { get; set; }
        [JsonPropertyName("exp_year")]
        public int ExpYear { get; set; }
    }
}

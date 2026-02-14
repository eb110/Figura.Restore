using Microsoft.EntityFrameworkCore;

namespace Figura.Restore.API.Entities.OrderAggregate
{
    [Owned] //no id -> no db table -> part of the order
    public class PaymentSummary
    {
        //cc details
        public int Last4 { get; set; }
        public required string Brand { get; set; }
        public int ExpMonth { get; set; }
        public int ExpYear { get; set; }
    }
}

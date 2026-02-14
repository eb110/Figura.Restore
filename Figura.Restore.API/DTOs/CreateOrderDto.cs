using Figura.Restore.API.Entities.OrderAggregate;

namespace Figura.Restore.API.DTOs
{
    //staff needed from the browser
    //rest of order parameters will be obtained either from the Basket or 
    //will be calculated / created
    public class CreateOrderDto
    {
        //we have to obtain these two parameters from the browser
        public required ShippingAddress ShippingAddress { get; set; }
        public required PaymentSummary PaymentSummary { get; set; }
    }
}

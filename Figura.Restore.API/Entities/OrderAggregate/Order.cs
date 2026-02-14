namespace Figura.Restore.API.Entities.OrderAggregate
{
    //all of the 'owned' classes will be inside order table
    public class Order
    {
        public int Id { get; set; }
        public required string BuyerEmail { get; set; }
        //owned
        public required ShippingAddress ShippingAddress { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public List<OrderItem> OrderItems { get; set; } = [];
        public long Subtotal { get; set; }
        public long DeliveryFee { get; set; }
        public long Discount { get; set; }
        //in theory it always should exist but as its a payment - we will be defensive here
        public string? PaymentIntentId { get; set; }
        public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;
        //owned
        public required PaymentSummary PaymentSummary { get; set; }

        public long GetTotal()
        {
            return Subtotal + DeliveryFee - Discount;
        }
    }
}

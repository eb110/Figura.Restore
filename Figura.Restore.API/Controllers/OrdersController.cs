using Figura.Restore.API.Data;
using Figura.Restore.API.DTOs;
using Figura.Restore.API.Entities;
using Figura.Restore.API.Entities.OrderAggregate;
using Figura.Restore.API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Figura.Restore.API.Controllers
{
    [Authorize]
    public class OrdersController(StoreContext context) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<List<Order>>> GetOrders()
        {
            //only current logged user orders
            var orders = await context.Orders
                .Include(x => x.OrderItems)
                //claims principal identity can be null here
                //extension method will verify it
                .Where(x => x.BuyerEmail.Equals(User.GetUsername())).ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Order>> GetOrderDetails(int id)
        {
            var order = await context.Orders
                //.Include(x => x.OrderItems)
                .Where(x => x.BuyerEmail.Equals(User.GetUsername()) && x.Id == id).FirstOrDefaultAsync();

            if (order == null) return NotFound();

            return Ok(order);
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
        {
            //the cookie 'basketId' travels as the reqest / response element
            //extension method of the 'Basket' 
            var basket = await context.Baskets.GetBasketWithItems(Request.Cookies["basketId"]);

            if(basket == null || basket.Items.Count == 0) return NotFound("Basket is empty or not found");

            var items = CreateOrderItems(basket.Items);

            var subtotal = items.Sum(x => x.Price * x.Quantity);
            var deliveryFee = CalculateDeliveryFee(subtotal);

            var order = new Order
            {
                OrderItems = items,
                BuyerEmail = User.GetUsername(),
                ShippingAddress = orderDto.ShippingAddress,
                DeliveryFee = deliveryFee,
                Subtotal = subtotal,
                PaymentSummary = orderDto.PaymentSummary,
                PaymentIntentId = basket.PaymentIntentId,
            };

            context.Orders.Add(order);
            //the order is finished - remove the basket!!!
            context.Baskets.Remove(basket);
            //the order is finished - remove the cookie!!!
            Response.Cookies.Delete("basketId");

            var result = await context.SaveChangesAsync() > 0;
            if (!result) return BadRequest("problem creating order");

            //this will create a location header
            //where the client can find recently created order  
            return CreatedAtAction(nameof(GetOrderDetails), new { id = order.Id }, order);
        }

        private long CalculateDeliveryFee(long subtotal)
        {
            throw new NotImplementedException();
        }

        private List<OrderItem> CreateOrderItems(List<BasketItem> items)
        {
            throw new NotImplementedException();
        }
    }
}

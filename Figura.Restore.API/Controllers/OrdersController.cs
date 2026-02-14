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
        public async Task<ActionResult<List<OrderDto>>> GetOrders()
        {
            //only current logged user orders
            var orders = await context.Orders
                .ProjectToDto()            
                //claims principal identity can be null here
                //extension method will verify it
                .Where(x => x.BuyerEmail.Equals(User.GetUsername())).ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDto>> GetOrderDetails(int id)
        {
            var order = await context.Orders
                .ProjectToDto()
                .Where(x => x.BuyerEmail.Equals(User.GetUsername()) && x.Id == id).FirstOrDefaultAsync();

            if (order == null) return NotFound();

            return Ok(order);
        }

        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto orderDto)
        {
            //the cookie 'basketId' travels as the reqest / response element
            //extension method of the 'Basket' 
            var basket = await context.Baskets.GetBasketWithItems(Request.Cookies["basketId"]);

            if(basket == null || basket.Items.Count == 0) return NotFound("Basket is empty or not found");

            var items = CreateOrderItems(basket.Items);

            if (items == null || items.Count == 0 || string.IsNullOrEmpty(basket.PaymentIntentId)) return NotFound("some items out of stock");

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
            return CreatedAtAction(nameof(GetOrderDetails), new { id = order.Id }, order.ToDto());
        }

        private long CalculateDeliveryFee(long subtotal)
        {
            return subtotal > 10000 ? 0 : 500;
        }

        private List<OrderItem>? CreateOrderItems(List<BasketItem> items)
        {
            var list = new List<OrderItem>();
            foreach (var item in items)
            {
                //business rule
                //if stock is less then ordered value for any ordered item - return null
                if (item.Quantity > item.Product.QuantityInStock)
                {
                    return null;
                }

                var orderItem = new OrderItem
                {            
                    ItemOrdered = new ProductItemOrdered
                    {
                        ProductId = item.ProductId,
                        Name = item.Product.Name,
                        PictureUrl = item.Product.PictureUrl
                    },
                    Price = item.Product.Price,
                    Quantity = item.Quantity
                };
                list.Add(orderItem);

                item.Product.QuantityInStock -= item.Quantity;
            }
            return list;
        }
    }
}

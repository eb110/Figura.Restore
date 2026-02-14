using Figura.Restore.API.Data;
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
    }
}

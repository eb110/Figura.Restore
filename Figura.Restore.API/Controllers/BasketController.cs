using Figura.Restore.API.Data;
using Figura.Restore.API.DTOs;
using Figura.Restore.API.Entities;
using Figura.Restore.API.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Figura.Restore.API.Controllers
{
    public class BasketController(StoreContext context) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<BasketDto>> GetBasket()
        {
            var basket = await RetreiveBasket();

            if (basket == null)
            {
                return NoContent();
            }

            var basketDto = basket.ToDto();

            return basketDto;
        }

        [HttpPost]
        public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
        {
            //get basket
            var basket = await RetreiveBasket();
            //create basket if null
            if (basket == null)
            {
                basket = CreateBasket();
            }
            //get product
            var product = await context.Products.FirstOrDefaultAsync(x => x.Id == productId);

            if(product == null)
            {
                return BadRequest($"problem finding {productId} product");
            }
            //add item to basket
            basket.AddItem(product, quantity);
            //save changes - check if number of changes is greate than 0
            var result = await context.SaveChangesAsync() > 0;

            if (result)
            {
                return CreatedAtAction(nameof(GetBasket), basket.ToDto());              
            }

            return BadRequest("problem updating basket in db");
        }

        [HttpDelete]
        public async Task<ActionResult> RemoveItemFromBasket(int productId, int quantity)
        {
            //get basket
            var basket = await RetreiveBasket();

            if(basket == null)
            {
                return BadRequest($"unable to remove product {productId}");
            }
            //remove item or reduce its quantity
            basket.RemoveItem(productId, quantity);
            //save changes

            var result = await context.SaveChangesAsync() > 0;

            if (result)
            {
                return CreatedAtAction(nameof(GetBasket), basket.ToDto());
            }

            return BadRequest("problem updating basket in db");
        }

        private Basket CreateBasket()
        {
            var basketId = Guid.NewGuid().ToString();

            var cookieOptions = new CookieOptions
            {
                IsEssential = true,
                Expires = DateTime.UtcNow.AddDays(30)
            };
            Response.Cookies.Append("basketId", basketId, cookieOptions);

            var basket = new Basket { BasketId = basketId };
            context.Baskets.Add(basket);

            return basket;
        }

        private async Task<Basket?> RetreiveBasket()
        {
          var basket = await context.Baskets
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.BasketId == Request.Cookies["basketId"]);

            return basket;
        }
    }
}

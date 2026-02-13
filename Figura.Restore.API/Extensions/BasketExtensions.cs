using Figura.Restore.API.DTOs;
using Figura.Restore.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace Figura.Restore.API.Extensions
{
    public static class BasketExtensions
    {
        public static BasketDto ToDto(this Basket basket)
        {
            var basketDto = new BasketDto
            {
                BasketId = basket.BasketId,
                PaymentIntentId = basket.PaymentIntentId,
                ClientSecret = basket.ClientSecret,
                Items = basket.Items.Select(x => new BasketItemDto
                {
                    ProductId = x.ProductId,
                    Name = x.Product.Name,
                    Price = x.Product.Price,
                    PictureUrl = x.Product.PictureUrl,
                    Brand = x.Product.Brand,
                    Type = x.Product.Type,
                    Quantity = x.Quantity,
                }).ToList()
            };

            return basketDto;
        }

        public static async Task<Basket?> GetBasketWithItems(this IQueryable<Basket> query, string? basketId)
        {
            return await query
                .Include(x => x.Items)
                .ThenInclude(x => x.Product)
                .FirstOrDefaultAsync(x => x.BasketId == basketId);
        }
    }
}

using Figura.Restore.API.Data;
using Figura.Restore.API.DTOs;
using Figura.Restore.API.Extensions;
using Figura.Restore.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Figura.Restore.API.Controllers
{
    public class PaymentsController(PaymentsService paymentsService, StoreContext context) : BaseApiController
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<BasketDto>> CreateOrUpdatePaymentIntent()
        {
            //client sends back the cookie => basketId -> it is issued by the api
            //and for this very request the browser bounds it with client response
            var basket = await context.Baskets.GetBasketWithItems(Request.Cookies["basketId"]);

            if(basket == null)
            {
                return BadRequest("Problem with the basket");
            }

            //payment update / create
            var intent = await paymentsService.CreateOrUpdatePaymentIntent(basket);

            if (intent == null)
            {
                return BadRequest("Problem creating payment intent");
            }

            //if new basket // transaction
            basket.PaymentIntentId ??= intent.Id;
            basket.ClientSecret ??= intent.ClientSecret;

            //if the transaction intent id has been populated with new value
            if (context.ChangeTracker.HasChanges())
            {
                var result = await context.SaveChangesAsync() > 0;

                if (!result)
                {
                    return BadRequest("Problem updating basket with intent");
                }
            }

            return basket.ToDto();
        }
    }
}

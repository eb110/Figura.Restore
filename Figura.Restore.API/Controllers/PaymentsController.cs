using Figura.Restore.API.Data;
using Figura.Restore.API.DTOs;
using Figura.Restore.API.Entities.OrderAggregate;
using Figura.Restore.API.Extensions;
using Figura.Restore.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Climate;

namespace Figura.Restore.API.Controllers
{
    public class PaymentsController(PaymentsService paymentsService, StoreContext context, IConfiguration config, ILogger<PaymentsController> logger) : BaseApiController
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<BasketDto>> CreateOrUpdatePaymentIntent()
        {
            //client sends back the cookie => basketId -> it is issued by the api
            //and for this very request the browser bounds it with client response
            var basket = await context.Baskets.GetBasketWithItems(Request.Cookies["basketId"]);

            if (basket == null)
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

        //stripe has to send us the webhook to inform about the payment
        //this eventually should change the status from pending to success / failure
        //simple action result ok is significant as a respose
        [HttpPost("Webhook")]
        public async Task<ActionResult> StripeWebhook()
        {
            var json = await new StreamReader(Request.Body).ReadToEndAsync();

            try
            {
                var stripeEvent = ConstructStripeEvent(json);
                if (stripeEvent.Data.Object is not PaymentIntent intent)
                {
                    return BadRequest("Invalid intent data");
                }

                if (intent.Status.Equals("succeeded"))
                {
                    await HandlePaymentIntentSucceeded(intent);
                }
                else
                {
                    await HandlePaymentIntentFailed(intent);
                }

                return Ok();
            }
            catch (StripeException ex)
            {
                logger.LogError(ex, "Stripe webhook error");
                return StatusCode(StatusCodes.Status500InternalServerError, "Webhook error");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error has occured");
                return StatusCode(StatusCodes.Status500InternalServerError, "Unexpected error");
            }
        }

        private async Task HandlePaymentIntentFailed(PaymentIntent intent)
        {
            var order = await context.Orders
                .Include(x => x.OrderItems)
                .FirstOrDefaultAsync(x => x.PaymentIntentId == intent.Id) ?? throw new Exception("Order not found");

            //we have to update the warehouse quantity for each item
            foreach (var item in order.OrderItems)
            {
                //get the product to update
                var product = await context.Products.FindAsync(item.ItemOrdered.ProductId) ?? throw new Exception("product not found");

                product.QuantityInStock += item.Quantity;
            }
            order.OrderStatus = OrderStatus.PaymentFailed;

            await context.SaveChangesAsync();
        }

        private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
        {
            var order = await context.Orders
               .FirstOrDefaultAsync(x => x.PaymentIntentId == intent.Id) ?? throw new Exception("Order not found");

            //intent is a constant current value of the order from stripe
            //it can happen the user will open the same page twice and try to manipulate the order
            //this is why we have to compare stripe intent with actual client request
            if (order.GetTotal() != intent.Amount)
            {
                order.OrderStatus = OrderStatus.PaymentMismatch;
            }
            else
            {
                order.OrderStatus = OrderStatus.PaymentReceived;
            }

            var basket = await context.Baskets.FirstOrDefaultAsync(x => x.PaymentIntentId == intent.Id);

            if (basket != null)
            {
                context.Remove(basket);
            }

            await context.SaveChangesAsync();
        }

        private Event ConstructStripeEvent(string json)
        {
            try
            {
                return EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], config["StripeSettings:WhSecret"]);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to construct the stripe event");
                throw new StripeException("Invalid signature");
            }
        }
    }
}

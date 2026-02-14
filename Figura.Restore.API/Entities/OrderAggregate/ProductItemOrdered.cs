using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace Figura.Restore.API.Entities.OrderAggregate
{
    //orders are going to have a one to many relationship with an order item
    //inside order item we're going to track the ProductItemOrdered
    //historical snapshot of the ordered item of particular order
    //historical snapshot as the picture or name can change overtime
    //but original state of the time when the order being created will be archived in db
    [Owned] //no id needed -> part of order -> no own table in db
    public class ProductItemOrdered
    {
        public int ProductId { get; set; }
        public required string Name { get; set; }
        public required string PictureUrl { get; set; }
    }
}

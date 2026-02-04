using System.ComponentModel.DataAnnotations.Schema;

namespace Figura.Restore.API.Entities
{
    //here we have one to many relation
    //because of this we don't have to specifically establish dbset in dbcontext
    //ef will handle it itelf

    [Table("BasketItems")]
    public class BasketItem
    {
        public int Id { get; set; }
        public int Quantity { get; set; }

        //navigation propery -> relationship one to one
        public int ProductId { get; set; }
        public required Product Product { get; set; }

        //relationship one to many
        public int BasketId { get; set; }
        public Basket Basket { get; set; } = null!;
    }
}
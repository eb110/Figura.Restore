namespace Figura.Restore.API.Entities
{
    public class Basket
    {
        public int Id { get; set; }
        public required string BasketId { get; set; }

        //here we have one to many relation
        //because of this we don't have to specifically establish dbset in dbcontext
        //ef will handle it itelf
        public List<BasketItem> Items { get; set; } = [];

        //EF will track the just obtained item from db
        //by track - it will track add or track remove
        //track the state of the entity in memory
        //these are just helpers methods

        public void AddItem(Product product, int quantity)
        {
            if (product == null) ArgumentNullException.ThrowIfNull(product);
            if (quantity <= 0) throw new ArgumentException("Quantity should be above 0", nameof(quantity));

            //have to check if the item is already in the basket
            //if so - increase the quantity
            //if no - add it to the basket
            var existingItem = FindItem(product.Id);

            //if the item is not in the basket
            if (existingItem == null)
            {
                Items.Add(new BasketItem
                {
                    Product = product,
                    Quantity = quantity,
                });
            }
            //if the item is in the basket
            else
            {
                existingItem!.Quantity += quantity;
            }
        }

        //remove an item from the basket or decrease its quantity
        public void RemoveItem(int productId, int quantity)
        {
            if (quantity <= 0) throw new ArgumentException("Quantity should be above 0", nameof(quantity));

            var item = FindItem(productId);
            //in theory the item should not be null
            if (item == null) return;

            item.Quantity -= quantity;
            if(item.Quantity <= 0)
            {
                Items.Remove(item);
            }
        }

        //its optional as the item can or can't be in the basket
        private BasketItem? FindItem(int id)
        {
            return Items.FirstOrDefault(item => item.ProductId == id);
        }
    }

}

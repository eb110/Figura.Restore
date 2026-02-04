namespace Figura.Restore.API.DTOs
{
    public class BasketDto
    {
        public required string BasketId { get; set; }

        //here we have one to many relation
        //because of this we don't have to specifically establish dbset in dbcontext
        //ef will handle it itelf
        public List<BasketItemDto> Items { get; set; } = [];
    }
}

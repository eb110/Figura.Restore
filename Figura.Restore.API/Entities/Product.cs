namespace Figura.Restore.API.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public long Price { get; set; }
        //originally it was a location of the picture in clients folder
        //after hooking up the cloudinary server -> it is the uri of the picture
        //on the cloudinary server
        public required string PictureUrl { get; set; }
        //id of the image on the cloudinary server
        public string? PublicId { get; set; }
        public required string Type { get; set; }
        public required string Brand { get; set; }
        public int QuantityInStock { get; set; }

    }
}

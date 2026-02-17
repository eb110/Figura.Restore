using System.ComponentModel.DataAnnotations;

namespace Figura.Restore.API.DTOs
{
    public class CreateProductDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string Description { get; set; } = string.Empty;
        [Required]
        [Range(100, double.PositiveInfinity)]
        public long Price { get; set; }

        //initially pictured were stored on client folder
        //after hooking up the cloudinary server -> it is a strict backend process
        //to handle pictures upload - download
        //this is why this parameters is no longer needed on dto
        //public string PictureUrl { get; set; } = string.Empty;

        [Required]
        //IFormFile as this is the standard Request body type for File
        public IFormFile File { get; set; } = null!;
        [Required]
        public string Type { get; set; } = string.Empty;
        [Required]
        public string Brand { get; set; } = string.Empty;
        [Required]
        [Range(0, int.MaxValue)]
        public int QuantityInStock { get; set; }
    }
}

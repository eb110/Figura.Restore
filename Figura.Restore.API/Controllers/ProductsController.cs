using AutoMapper;
using Figura.Restore.API.Data;
using Figura.Restore.API.DTOs;
using Figura.Restore.API.Entities;
using Figura.Restore.API.Extensions;
using Figura.Restore.API.RequestHelpers;
using Figura.Restore.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Figura.Restore.API.Controllers
{
    //image service is needed as product contains cloudinary server picture id
    public class ProductsController(StoreContext context, IMapper mapper, ImageService imageService) : BaseApiController
    {

        [HttpGet]
        public async Task<ActionResult<List<Product>>> GetProducts([FromQuery] ProductParams productParams)
        {
            IQueryable<Product> query = context.Products
                .Sort(productParams.OrderBy)
                .Search(productParams.SearchTerm)
                .Filter(productParams.Brands, productParams.Types)
                .AsQueryable();

            //deffer the execution
            var products = await PagedList<Product>.ToPagedList(query, productParams.PageNumber, productParams.PageSize);

            Response.AddPaginationHeader(products.Metadata);

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProductById(int id)
        {
            var product = await context.Products.Where(x => x.Id == id).FirstOrDefaultAsync();

            if (product is null)
            {
                return NotFound(id);
            }

            return Ok(product);
        }

        [HttpGet("filters")]
        public async Task<IActionResult> GetFilters()
        {
            var brands = await context.Products.Select(x => x.Brand).Distinct().ToListAsync();
            var types = await context.Products.Select(x => x.Type).Distinct().ToListAsync();

            return Ok(new { brands, types });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(CreateProductDto productDto)
        {
            Product product = mapper.Map<Product>(productDto); 
            
            if(productDto.File != null)
            {
                var imageResult = await imageService.AddImageAsync(productDto.File);

                //error from cloudinary
                if(imageResult.Error != null)
                {
                    return BadRequest(imageResult.Error.Message);
                }

                //strict uri on the cloudinary server of a file (product picture)
                product.PictureUrl = imageResult.SecureUrl.AbsoluteUri;
                product.PublicId = imageResult.PublicId;
            }

            context.Products.Add(product);

            var result = await context.SaveChangesAsync() > 0;

            if(result)
            {
                return CreatedAtAction(nameof(GetProductById), new {Id = product.Id}, product);
            }

            return BadRequest("Problem creating new product");
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<ActionResult> UpdateProduct(UpdateProductDto productDto)
        {
            var product = await context.Products.FindAsync(productDto.Id);

            if (product == null) return NotFound();

            //automatic update (map) -> tracked by ef as well
            mapper.Map(productDto, product);

            if (productDto.File != null)
            {
                var imageResult = await imageService.AddImageAsync(productDto.File);

                //error from cloudinary
                if (imageResult.Error != null)
                {
                    return BadRequest(imageResult.Error.Message);
                }

                //if the product consist the image id -> we want to delete image from cloudinary server
                if(!string.IsNullOrEmpty(product.PublicId))
                {
                    await imageService.DeleteImageAsync(product.PublicId);
                }

                //strict uri on the cloudinary server of a file (product picture)
                product.PictureUrl = imageResult.SecureUrl.AbsoluteUri;
                product.PublicId = imageResult.PublicId;
            }

            var result = await context.SaveChangesAsync() > 0;

            if (result)
            {
                //its an update - we don't have to send anything back
                return NoContent();
            }

            return BadRequest("Problem updating product");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var product = await context.Products.FindAsync(id);

            if (product == null) return NotFound();

            if (!string.IsNullOrEmpty(product.PublicId))
            {
                await imageService.DeleteImageAsync(product.PublicId);
            }

            context.Products.Remove(product);

            var result = await context.SaveChangesAsync() > 0;

            if (result)
            {
                //its a deleted - we don't have to send anything back
                return Ok();
            }

            return BadRequest("Problem deleting product");
        }
    }
}

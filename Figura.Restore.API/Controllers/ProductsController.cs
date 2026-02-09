using Figura.Restore.API.Data;
using Figura.Restore.API.Entities;
using Figura.Restore.API.Extensions;
using Figura.Restore.API.RequestHelpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Figura.Restore.API.Controllers
{
    public class ProductsController(StoreContext context) : BaseApiController
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
    }
}

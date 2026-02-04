using Figura.Restore.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace Figura.Restore.API.Data
{
    public class StoreContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<Product> Products { get; set; }
        public DbSet<Basket> Baskets { get; set; }
    }
}
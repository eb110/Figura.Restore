using Figura.Restore.API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Figura.Restore.API.Data
{
    public class StoreContext(DbContextOptions options) : IdentityDbContext<User>(options)
    {
        public DbSet<Product> Products { get; set; }
        public DbSet<Basket> Baskets { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<IdentityRole>()
                .HasData(
                    new IdentityRole {Id = "f356d96a-365f-4023-9910-2e2f262236d3", ConcurrencyStamp = "Member", 
                        Name = "Memeber", NormalizedName = "MEMBER" },
                    new IdentityRole {Id = "a13ab40d-0a1b-47a9-a0ab-b57d0764d3ce", ConcurrencyStamp = "Admin", 
                        Name = "Admin", NormalizedName = "ADMIN" }
                );
        }
    }
}
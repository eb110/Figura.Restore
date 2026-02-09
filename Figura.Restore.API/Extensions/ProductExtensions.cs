using Figura.Restore.API.Entities;

namespace Figura.Restore.API.Extensions
{
    public static class ProductExtensions
    {
        public static IQueryable<Product> Sort(this IQueryable<Product> query, string? orderBy)
        {
            query = orderBy switch
            {
                "price" => query.OrderBy(x => x.Price),
                "priceDesc" => query.OrderByDescending(x => x.Price),
                _ => query.OrderBy(x => x.Name)
            };

            return query;
        }

        public static IQueryable<Product> Search(this IQueryable<Product> query, string? searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm)) return query;

            var lowerVersion = searchTerm.Trim().ToLower();

            return query.Where(x => x.Name.ToLower().Contains(lowerVersion));
        }

        public static IQueryable<Product> Filter(this IQueryable<Product> query, string? brands, string? types)
        {
            var brandList = !string.IsNullOrEmpty(brands) ? brands.ToLower().Split(',').ToList() : new List<string>();
            var typeList = !string.IsNullOrEmpty(types) ? types.ToLower().Split(',').ToList() : new List<string>();

            if(brandList.Count > 0)
            {
                query = query.Where(x => brandList.Contains(x.Brand.ToLower()));
            }
            if(typeList.Count > 0)
            {
                query = query.Where(x => typeList.Contains(x.Type.ToLower()));
            } 

            return query;
        }
    }
}

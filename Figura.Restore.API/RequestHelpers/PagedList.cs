using Microsoft.EntityFrameworkCore;

namespace Figura.Restore.API.RequestHelpers
{
    public class PagedList<T> : List<T>
    {
        public PagedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            Metadata = new PaginationMetadata
            {
                //total number of possible db records based on the current query
                TotalCount = count,
                //how many items per page => n products on page
                PageSize = pageSize,
                //current page => 1.2.3...
                CurrentPage = pageNumber,
                //total possible records divided by page size => 18 total, 8 per page => 3 pages (8, 8, 2)
                TotalPages = (int)Math.Ceiling(count / (double)pageSize)
            };
            AddRange(items);
        }

        public PaginationMetadata Metadata { get; set; }

        public static async Task<PagedList<T>> ToPagedList(IQueryable<T> query, int pageNumber, int pageSize)
        {
            var count = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedList<T>(items, count, pageNumber, pageSize);
        }
    }
}

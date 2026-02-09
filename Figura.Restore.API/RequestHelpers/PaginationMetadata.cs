namespace Figura.Restore.API.RequestHelpers
{
    //return object to the client (based on pagination / product helpers)
    public class PaginationMetadata
    {
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
    }
}

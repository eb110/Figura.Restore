namespace Figura.Restore.API.RequestHelpers
{
    //different approach to get appsettings values
    public class CloudinarySettings
    {
        public required string CloudName { get; set; }
        public required string ApiKey { get; set; }
        public required string ApiSecret { get; set; }
    }
}

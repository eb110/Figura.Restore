using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Figura.Restore.API.RequestHelpers;
using Microsoft.Extensions.Options;

namespace Figura.Restore.API.Services
{
    public class ImageService
    {
        private readonly Cloudinary _cloudinary;
        public ImageService(IOptions<CloudinarySettings> config)
        {
            var acc = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
                );

            _cloudinary = new Cloudinary( acc );
        }

        public async Task<ImageUploadResult> AddImageAsync(IFormFile file)
        {
            var uploadResult = new ImageUploadResult();

            //usage of stream (memory alloc) -> has to be handled by using to trigger garbage collector
            if(file.Length > 0)
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    //location on cloudinary side
                    Folder = "Figura-Restore"
                };
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            return uploadResult;
        }

        public async Task<DeletionResult> DeleteImageAsync(string publicId)
        {
            var deleteParams = new DeletionParams(publicId);

            var result = await _cloudinary.DestroyAsync(deleteParams);

            return result;
        }
    }
}

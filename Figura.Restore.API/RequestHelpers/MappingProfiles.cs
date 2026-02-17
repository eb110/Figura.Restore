using AutoMapper;
using Figura.Restore.API.DTOs;
using Figura.Restore.API.Entities;

namespace Figura.Restore.API.RequestHelpers
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>();
        }
    }
}

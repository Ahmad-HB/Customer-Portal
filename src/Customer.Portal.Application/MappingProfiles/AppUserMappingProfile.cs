using AutoMapper;
using Customer.Portal.DTOs.AppUserDTOs;
using Customer.Portal.Entities;

namespace Customer.Portal.MappingProfiles;

public class AppUserMappingProfile : Profile
{
 
    public AppUserMappingProfile()
    {
        CreateMap<CreateUpdateAppUserDto, AppUser>();
        CreateMap<AppUser, AppUserDto>();
        
    }
}
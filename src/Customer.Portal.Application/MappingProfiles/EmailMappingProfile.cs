using AutoMapper;
using Customer.Portal.DTOs.AppUserDTOs;
using Customer.Portal.DTOs.EmailDTOs;
using Customer.Portal.Entities;

namespace Customer.Portal.MappingProfiles;

public class EmailMappingProfile : Profile
{
    public EmailMappingProfile()
    {
        CreateMap<CreateUpdateEmailDto, Email>();
        CreateMap<Email, EmailDto>();
    }
}
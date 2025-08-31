using AutoMapper;
using Customer.Portal.DTOs.UserServicePlanDTOs;
using Customer.Portal.Entities;

namespace Customer.Portal.MappingProfiles;

public class UserServicePlanMappingProfile : Profile
{
    public UserServicePlanMappingProfile()
    {
        CreateMap<UserServicePlan, UserServicePlanDto>();
        CreateMap<CreateUpdateUserServicePlanDto, UserServicePlan>();
        
    }
}
using AutoMapper;
using Customer.Portal.DTOs.ServicePlanDTOs;
using Customer.Portal.Entities;

namespace Customer.Portal.MappingProfiles;

public class ServicePlanMappingProfile : Profile
{
    public ServicePlanMappingProfile()
    {
        CreateMap<CreateUpdateServicePlanDto, ServicePlan>();
        CreateMap<ServicePlan, ServicePlanDto>();
        
    }
}
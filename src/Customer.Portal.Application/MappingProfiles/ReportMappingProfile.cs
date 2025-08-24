using AutoMapper;
using Customer.Portal.DTOs.ReportDTOs;
using Customer.Portal.Entities;

namespace Customer.Portal.MappingProfiles;

public class ReportMappingProfile : Profile
{
    public ReportMappingProfile()
    {
        CreateMap<CreateUpdateReportDto, Report>();
        CreateMap<Report, ReportDto>();
    }
}
using AutoMapper;
using Customer.Portal.DTOs.SupportTicketDTOs;
using Customer.Portal.Entities;

namespace Customer.Portal.MappingProfiles;

public class SupportTicketMappingProfile : Profile
{
    public SupportTicketMappingProfile()
    {
        CreateMap<CreateUpdateSupportTicketDto, SupportTicket>();
        CreateMap<SupportTicket, SupportTicketDto>();
    }
}
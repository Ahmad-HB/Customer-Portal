using AutoMapper;
using Customer.Portal.DTOs.TicketCommentDTOs;
using Customer.Portal.Entities;

namespace Customer.Portal.MappingProfiles;

public class TicketCommentMappingProfile : Profile
{
    public TicketCommentMappingProfile()
    {
        CreateMap<CreateUpdateTicketCommentDto, TicketComment>();
        CreateMap<TicketComment, TicketCommentDto>();
    }
}
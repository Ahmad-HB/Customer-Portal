using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Customer.Portal.DTOs.TicketCommentDTOs;

public interface ITicketCommentAppService : IApplicationService
{
    
    public Task<TicketCommentDto> GetTicketCommentAsync(Guid id);
    
    public Task<PagedResultDto<TicketCommentDto>> GetTicketCommentsAsync(Guid ticketId);
    
}
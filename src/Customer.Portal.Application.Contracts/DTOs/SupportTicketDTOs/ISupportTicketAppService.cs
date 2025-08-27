using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Enums;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Customer.Portal.DTOs.SupportTicketDTOs;

public interface ISupportTicketAppService : IApplicationService
{
    public Task CreateSupportTicketAsync(CreateUpdateSupportTicketDto input);
    
    public Task<SupportTicketDto> GetSupportTicketByIdAsync(Guid supportTicketId);
    
    public Task<List<PagedResultDto<SupportTicketDto>>> GetSupportTicketsAsync();
    
    public Task DeleteSupportTicketAsync(Guid supportTicketId);
    
    public Task AssignSupportAgentAsync(Guid supportTicketId);
    
    public Task AssignTechnicianAsync(Guid supportTicketId, Guid technicianId);
    
    public Task UpdateTicketStatusAsync(Guid supportTicketId, TicketStatus status);
    
    public Task UpdateTicketPriorityAsync(Guid supportTicketId, TicketPriority priority);
    
    public Task AddCommentToTicketAsync(Guid supportTicketId, string comment);
    
    public Task RemoveCommentFromTicketAsync(Guid supportTicketId, Guid ticketCommentId);
}
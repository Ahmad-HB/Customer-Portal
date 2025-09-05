using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Services;

namespace Customer.Portal.FeaturesManagers.MSupportTicket;

public interface ISupportTicketManager : IDomainService
{
    public Task CreateSupportTicketAsync(SupportTicket supportTicket, Guid identityUserId);
    
    public Task<SupportTicket> GetSupportTicketByIdAsync(Guid supportTicketId);

    public Task<List<SupportTicket>> GetSupportTicketsAsync(Guid identityUserId);
    
    public Task DeleteSupportTicketAsync(Guid supportTicketId);
    
    public Task<bool> AssignSupportAgentAsync(Guid supportTicketId);
    
    public Task AssignTechnicianAsync(Guid supportTicketId, Guid technicianId);
    
    public Task UpdateTicketStatusAsync(Guid supportTicketId, TicketStatus status);
    
    public Task UpdateTicketPriorityAsync(Guid supportTicketId, TicketPriority priority);
    
    // public Task AddCommentToTicketAsync(Guid supportTicketId, string comment, Guid userId);
    
    public Task NotifyUserOnTicketUpdateAsync(Guid supportTicketId, UpdateType updateType);
    
    // public Task RemoveCommentFromTicketAsync(Guid supportTicketId, Guid ticketCommentId);
    
}
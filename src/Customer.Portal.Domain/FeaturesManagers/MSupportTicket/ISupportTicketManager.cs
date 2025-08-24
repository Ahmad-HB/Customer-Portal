using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Volo.Abp.Domain.Services;

namespace Customer.Portal.FeaturesManagers.MSupportTicket;

public interface ISupportTicketManager : IDomainService
{
    public Task CreateSupportTicketAsync(SupportTicket supportTicket, Guid identityUserId);
    
    public Task<SupportTicket> GetSupportTicketByIdAsync(Guid supportTicketId);
    
    public Task<List<SupportTicket>> GetSupportTicketsAsync();
    
    public Task DeleteSupportTicketAsync(Guid supportTicketId);
    
    public Task AssignSupportAgentAsync(Guid supportTicketId, Guid supportAgentId);
    
    public Task AssignTechnicianAsync(Guid supportTicketId, Guid technicianId);
    
    public Task UpdateTicketStatusAsync(Guid supportTicketId, string status);
    
    public Task UpdateTicketPriorityAsync(Guid supportTicketId, string priority);
    
    public Task AddCommentToTicketAsync(Guid supportTicketId, Guid appUserId, string comment);
    
    public Task NotifyUserOnTicketUpdateAsync(Guid supportTicketId, string updateType);
    
    public Task RemoveCommentFromTicketAsync(Guid supportTicketId, Guid appUserId, string comment);
    
}
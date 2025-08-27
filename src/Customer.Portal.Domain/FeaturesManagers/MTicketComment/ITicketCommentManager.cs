using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Volo.Abp.Domain.Services;

namespace Customer.Portal.FeaturesManagers.MTicketComment;

public interface ITicketCommentManager : IDomainService
{
    public Task CreateTicketCommentAsync(TicketComment input);
    
    public Task DeleteTicketCommentAsync(Guid id);
    
    public Task<TicketComment> GetTicketCommentAsync(Guid id);
    
    public Task<List<TicketComment>> GetTicketCommentsAsync(Guid supportTicketId);
}
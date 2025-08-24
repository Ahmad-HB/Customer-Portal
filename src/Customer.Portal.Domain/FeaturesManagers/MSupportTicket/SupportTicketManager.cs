using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Microsoft.EntityFrameworkCore;
using Volo.Abp;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Identity;

namespace Customer.Portal.FeaturesManagers.MSupportTicket;

public class SupportTicketManager : DomainService, ISupportTicketManager
{
    #region Fields

    private readonly IRepository<SupportTicket, Guid> _supportTicketRepository;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;

    #endregion

    #region Ctor

    public SupportTicketManager(IRepository<SupportTicket, Guid> supportTicketRepository,
        IRepository<IdentityUser, Guid> userRepository)
    {
        _supportTicketRepository = supportTicketRepository;
        _identityUserRepository = userRepository;
    }

    #endregion


    #region Methods
    
    public async Task CreateSupportTicketAsync(SupportTicket supportTicket, Guid identityUserId)
    {
        var query = await _identityUserRepository.GetQueryableAsync();
        var identityUser = await _identityUserRepository.GetAsync(identityUserId);
        
        var appUserId = await query
            .Where(u => u.Id == identityUserId)
            .Select(u => EF.Property<Guid>(u, "AppUserId"))
            .FirstOrDefaultAsync();

        supportTicket.AppUserId = appUserId;
        supportTicket.Status = TicketStatus.Open;
        supportTicket.CreatedAt = DateTime.UtcNow;

        await _supportTicketRepository.InsertAsync(supportTicket);
    }

    public Task<SupportTicket> GetSupportTicketByIdAsync(Guid supportTicketId)
    {
        throw new NotImplementedException();
    }

    public Task<List<SupportTicket>> GetSupportTicketsAsync()
    {
        throw new NotImplementedException();
    }

    public Task DeleteSupportTicketAsync(Guid supportTicketId)
    {
        throw new NotImplementedException();
    }

    public Task AssignSupportAgentAsync(Guid supportTicketId, Guid supportAgentId)
    {
        throw new NotImplementedException();
    }

    public Task AssignTechnicianAsync(Guid supportTicketId, Guid technicianId)
    {
        throw new NotImplementedException();
    }

    public Task UpdateTicketStatusAsync(Guid supportTicketId, string status)
    {
        throw new NotImplementedException();
    }

    public Task UpdateTicketPriorityAsync(Guid supportTicketId, string priority)
    {
        throw new NotImplementedException();
    }

    public Task AddCommentToTicketAsync(Guid supportTicketId, Guid appUserId, string comment)
    {
        throw new NotImplementedException();
    }

    public Task NotifyUserOnTicketUpdateAsync(Guid supportTicketId, string updateType)
    {
        throw new NotImplementedException();
    }

    public Task RemoveCommentFromTicketAsync(Guid supportTicketId, Guid appUserId, string comment)
    {
        throw new NotImplementedException();
    }

    #endregion
}
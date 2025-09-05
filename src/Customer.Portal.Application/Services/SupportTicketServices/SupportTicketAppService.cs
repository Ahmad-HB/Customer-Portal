using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.DTOs.SupportTicketDTOs;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Customer.Portal.FeaturesManagers.MSupportTicket;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Users;

namespace Customer.Portal.Services.SupportTicketServices;

public class SupportTicketAppService : PortalAppService, ISupportTicketAppService
{
    #region Fields

    private readonly ISupportTicketManager _supportTicketManager;
    private readonly ICurrentUser _currentUser;

    #endregion

    #region Ctor

    public SupportTicketAppService(ISupportTicketManager supportTicketManager, ICurrentUser currentUser)
    {
        _supportTicketManager = supportTicketManager;
        _currentUser = currentUser;
    }

    #endregion

    #region Methods

    public async Task CreateSupportTicketAsync(CreateUpdateSupportTicketDto input)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        var supportTicket = ObjectMapper.Map<CreateUpdateSupportTicketDto, SupportTicket>(input);
        
        await _supportTicketManager.CreateSupportTicketAsync(supportTicket, identityUserId);
    }

    public async Task<SupportTicketDto> GetSupportTicketByIdAsync(Guid supportTicketId)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        var supportTicket =  await _supportTicketManager.GetSupportTicketByIdAsync(supportTicketId);
        
        return ObjectMapper.Map<SupportTicket, SupportTicketDto>(supportTicket);
    }

    public async Task<PagedResultDto<SupportTicketDto>> GetSupportTicketsAsync()
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        var supportTickets = await _supportTicketManager.GetSupportTicketsAsync(identityUserId);
        
        var supportTicketDtos = ObjectMapper.Map<List<SupportTicket>, List<SupportTicketDto>>(supportTickets);
        
        return new PagedResultDto<SupportTicketDto>(supportTickets.Count, supportTicketDtos);
    }

    public async Task DeleteSupportTicketAsync(Guid supportTicketId)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        await _supportTicketManager.DeleteSupportTicketAsync(supportTicketId);
    }

    public async Task AssignSupportAgentAsync(Guid supportTicketId)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        await _supportTicketManager.AssignSupportAgentAsync(supportTicketId);
    }

    public async Task AssignTechnicianAsync(Guid supportTicketId, Guid technicianId)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        await _supportTicketManager.AssignTechnicianAsync(supportTicketId, technicianId);
    }

    public async Task UpdateTicketStatusAsync(Guid supportTicketId, TicketStatus status)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        await _supportTicketManager.UpdateTicketStatusAsync(supportTicketId, status);
    }

    public async Task UpdateTicketPriorityAsync(Guid supportTicketId, TicketPriority priority)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        await _supportTicketManager.UpdateTicketPriorityAsync(supportTicketId, priority);
    }

    // public async Task AddCommentToTicketAsync(Guid supportTicketId, string comment)
    // {
    //     Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
    //     
    //     await _supportTicketManager.AddCommentToTicketAsync(supportTicketId, comment, identityUserId);
    //     
    // }
    
    // public async Task RemoveCommentFromTicketAsync(Guid supportTicketId, Guid ticketCommentId)
    // {
    //     Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
    //     
    //     await _supportTicketManager.RemoveCommentFromTicketAsync(supportTicketId, ticketCommentId);
    // }

    #endregion
}
using System;
using System.Threading.Tasks;
using Customer.Portal.DTOs.SupportTicketDTOs;
using Customer.Portal.Entities;
using Customer.Portal.FeaturesManagers.MSupportTicket;
using Volo.Abp;
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

    public async Task<Task> CreateSupportTicketAsync(CreateUpdateSupportTicketDto input)
    {
        var supportTicket = ObjectMapper.Map<CreateUpdateSupportTicketDto, SupportTicket>(input);
        
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        await _supportTicketManager.CreateSupportTicketAsync(supportTicket, identityUserId);
        
        return Task.CompletedTask;
    }

    #endregion
}
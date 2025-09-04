using System;
using System.Threading.Tasks;
using Customer.Portal.DTOs.EmailDTOs;
using Customer.Portal.Enums;
using Customer.Portal.FeaturesManagers.MEmail;
using Volo.Abp;
using Volo.Abp.Users;

namespace Customer.Portal.Services.EmailAppServices;

public class EmailAppService : PortalAppService, IEmailAppService
{
    #region Fields

    private readonly IEmailManager _emailManager;
    private readonly ICurrentUser _currentUser;
    

    #endregion

    #region Ctor

    public EmailAppService(IEmailManager emailManager, ICurrentUser currentUser)
    {
        _emailManager = emailManager;
        _currentUser = currentUser;
    }

    #endregion


    #region Methods

    public async Task SendEmailTestAsync(string adress, EmailType emailType)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("Current user is not logged in.");
        
        await _emailManager.SendEmailTestAsync(adress, emailType);
    }

    #endregion
}
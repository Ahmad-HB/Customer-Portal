using System;
using System.Linq;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Customer.Portal.FeaturesManagers.MAppUser;
using Customer.Portal.FeaturesManagers.MEmail;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Entities.Events;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EventBus;
using Volo.Abp.Identity;
using Volo.Abp.Identity.Settings;
using Volo.Abp.ObjectExtending;

namespace Customer.Portal.EventHandlers;

public class UserHandler : ILocalEventHandler<EntityCreatedEventData<IdentityUser>>,
    ITransientDependency,
    ILocalEventHandler<EntityCreatedEventData<AppUser>>,
    ILocalEventHandler<EntityUpdatedEventData<IdentityUser>>
{

    #region Fields

    private readonly Lazy<IdentityUserManager> _identityUserManager;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly Lazy<AppUserManager> _appUserManager;
    private readonly Lazy<OrganizationUnitManager> _organizationUnitManager;
    private readonly IRepository<OrganizationUnit, Guid> _organizationUnitRepository;
    private readonly IRepository<IdentityRole, Guid> _identityRoleRepository;
    private readonly ILogger<IdentityUserManager> _identityUserLogger;
    private readonly IEmailManager _emailManager;
    private readonly IRepository<EmailTemplate, Guid> _emailTemplateRepository;
    private readonly ILogger<UserHandler> _logger;


    #endregion


    #region Ctor

    public UserHandler(Lazy<IdentityUserManager> identityUserManager, Lazy<AppUserManager> appUserManager, Lazy<OrganizationUnitManager> organizationUnitManager, IRepository<OrganizationUnit, Guid> organizationUnitRepository, IRepository<IdentityUser, Guid> identityUserRepository, IRepository<IdentityRole, Guid> identityRoleRepository, ILogger<IdentityUserManager> identityUserLogger, IEmailManager emailManager, IRepository<EmailTemplate, Guid> emailTemplateRepository, ILogger<UserHandler> logger)
    {
        _identityUserManager = identityUserManager;
        _appUserManager = appUserManager;
        _organizationUnitManager = organizationUnitManager;
        _organizationUnitRepository = organizationUnitRepository;
        _identityUserRepository = identityUserRepository;
        _identityRoleRepository = identityRoleRepository;
        _identityUserLogger = identityUserLogger;
        _emailManager = emailManager;
        _emailTemplateRepository = emailTemplateRepository;
        _logger = logger;
    }

    #endregion
    
    
    public async Task HandleEventAsync(EntityCreatedEventData<IdentityUser> eventData)
    {
        var identityUser = eventData.Entity;
        var tenantId = eventData.Entity.TenantId;
        
        
        await _appUserManager.Value.RegisterAppUserAsync(identityUser, tenantId);
        
    }

    public async Task HandleEventAsync(EntityCreatedEventData<AppUser> eventData)
    {
        var appUser = eventData.Entity;
        var identityUserId = eventData.Entity.IdentityUserId;
        
        
        await _appUserManager.Value.CompleteAppUserRegisterAsync(appUser.Id, appUser.UserType);
        
        var identityUser = await _identityUserRepository.FirstOrDefaultAsync(u => u.Id == identityUserId);
        if (identityUser == null)
        {
            _logger.LogError("IdentityUser with ID {IdentityUserId} not found when trying to send registration email", identityUserId);
            return;
        }
        
        var query = await _identityUserRepository.GetQueryableAsync();
        
        await query.Where(u => u.Id == identityUserId)
            .ExecuteUpdateAsync(u => 
                u.SetProperty<Guid>(user => EF.Property<Guid>(user, "AppUserId"), appUser.Id));
        
        // var roleId = await _identityRoleRepository.FirstOrDefaultAsync(x => x.Name == "Customer");
        
        // identityUser.AddRole(Guid.Parse("3a1bd314-4d03-fe19-9a6b-b33550f93128"));
        // if (roleId != null)
        // {
        //     identityUser.AddRole(roleId.Id);
        // }
        // else
        // {
        //     _identityUserLogger.LogWarning("Role 'Customer' not found. Cannot assign role to user {UserId}", identityUserId);
        // }
        //
        // _identityUserLogger.LogInformation("User {UserId} assigned role {RoleId}", identityUserId, roleId);

        await _identityUserRepository.UpdateAsync(identityUser);
        
        // Check if email templates exist before trying to send emails
        var customerRegistrationTemplate = await _emailTemplateRepository.FirstOrDefaultAsync(et => et.EmailType == EmailType.CustomerRegistration);
        if (customerRegistrationTemplate != null)
        {
            
            await _emailManager.SendCustomerRegistrationEmailAsync(identityUser.Email, identityUser.Id);
        }
    }
    
    public async Task HandleEventAsync(EntityUpdatedEventData<IdentityUser> eventData)
    {
        try
        {
            var identityUser = eventData.Entity;
            
            _logger.LogInformation("IdentityUser updated event received for user {UserId} ({UserEmail})", 
                identityUser.Id, identityUser.Email);
            
            // Sync the AppUser with the updated IdentityUser
            await _appUserManager.Value.SyncAppUserWithIdentityUserAsync(identityUser);
            
            _logger.LogInformation("Successfully synced AppUser with IdentityUser {UserId}", identityUser.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error syncing AppUser with IdentityUser {UserId}", eventData.Entity.Id);
        }
    }
}
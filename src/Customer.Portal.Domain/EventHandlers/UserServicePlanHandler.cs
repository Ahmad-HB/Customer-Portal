using System;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.FeaturesManagers.MEmail;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Entities.Events;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.EventBus;
using Volo.Abp.Identity;

namespace Customer.Portal.EventHandlers;

public class UserServicePlanHandler : ILocalEventHandler<EntityUpdatedEventData<UserServicePlan>>,
    ITransientDependency
{

    #region Fields

    private readonly IEmailManager _emailManager;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IRepository<ServicePlan, Guid> _servicePlanRepository;
    private readonly ILogger<UserServicePlanHandler> _logger;

    #endregion
    
    #region Ctor

    public UserServicePlanHandler(
        IEmailManager emailManager,
        IRepository<AppUser, Guid> appUserRepository,
        IRepository<IdentityUser, Guid> identityUserRepository,
        IRepository<ServicePlan, Guid> servicePlanRepository,
        ILogger<UserServicePlanHandler> logger)
    {
        _emailManager = emailManager;
        _appUserRepository = appUserRepository;
        _identityUserRepository = identityUserRepository;
        _servicePlanRepository = servicePlanRepository;
        _logger = logger;
    }
    
    #endregion

    #region Methods

    public async Task HandleEventAsync(EntityUpdatedEventData<UserServicePlan> eventData)
    {
        try
        {
            var userServicePlan = eventData.Entity;
            
            // Get the app user and their identity user
            var appUser = await _appUserRepository.GetAsync(userServicePlan.AppUserId);
            var identityUser = await _identityUserRepository.GetAsync(appUser.IdentityUserId);
            var servicePlan = await _servicePlanRepository.GetAsync(userServicePlan.ServicePlanId);
            
            _logger.LogInformation("Sending service plan change confirmation email for plan {ServicePlanId} to user {UserId}", 
                userServicePlan.ServicePlanId, identityUser.Id);
            
            // Determine the action type and details
            string actionType;
            string actionDetails;
            
            if (userServicePlan.IsSuspended)
            {
                actionType = "Service Plan Suspension";
                actionDetails = $"Suspending service plan '{servicePlan.Name}' for user {identityUser.UserName}. Reason: {userServicePlan.SuspensionReason ?? "No reason provided"}";
            }
            else if (!userServicePlan.IsActive)
            {
                actionType = "Service Plan Deactivation";
                actionDetails = $"Deactivating service plan '{servicePlan.Name}' for user {identityUser.UserName}";
            }
            else
            {
                actionType = "Service Plan Change";
                actionDetails = $"Changing service plan to '{servicePlan.Name}' for user {identityUser.UserName}";
            }
            
            // Send confirmation email
            await _emailManager.SendConfirmationEmailAsync(identityUser.Email, identityUser.Id, actionType, actionDetails);
            
            _logger.LogInformation("Service plan confirmation email process completed for plan {ServicePlanId}", userServicePlan.ServicePlanId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling user service plan updated event for plan {ServicePlanId}", eventData.Entity.Id);
        }
    }

    #endregion
    
}

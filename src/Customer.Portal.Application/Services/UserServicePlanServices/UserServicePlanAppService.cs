using System;
using System.Threading.Tasks;
using Customer.Portal.DTOs.UserServicePlanDTOs;
using Customer.Portal.FeaturesManagers.MUserServicePlan;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Users;

namespace Customer.Portal.Services.UserServicePlanServices;

public class UserServicePlanAppService : PortalAppService, IUserServicePlanAppService
{
    #region Fields

    private readonly IUserServicePlanManager _userServicePlanManager;
    private readonly ICurrentUser _currentUser;
    

    #endregion


    #region Ctor

    public UserServicePlanAppService(IUserServicePlanManager userServicePlanManager, ICurrentUser currentUser)
    {
        _userServicePlanManager = userServicePlanManager;
        _currentUser = currentUser;
    }

    #endregion

    #region Methods

    public async Task<PagedResultDto<UserServicePlanDto>> GetUserServicePlansAsync()
    {
        Guid identityUserId = _currentUser.Id ?? throw new Exception("User is not logged in.");

        var userServicePlans = await _userServicePlanManager.GetUserServicePlansAsync(identityUserId);

        return new PagedResultDto<UserServicePlanDto>(userServicePlans.Count, ObjectMapper.Map<System.Collections.Generic.List<Entities.UserServicePlan>, System.Collections.Generic.List<UserServicePlanDto>>(userServicePlans));
    }

    public async Task<UserServicePlanDto> GetUserServicePlanAsync(Guid id)
    {
        Guid identityUserId = _currentUser.Id ?? throw new Exception("User is not logged in.");

        var userServicePlan = await _userServicePlanManager.GetUserServicePlanAsync(identityUserId, id);

        return ObjectMapper.Map<Entities.UserServicePlan, UserServicePlanDto>(userServicePlan);
    }

    public async Task SuspendUserServicePlanAsync(Guid id)
    {
        Guid identityUserId = _currentUser.Id ?? throw new Exception("User is not logged in.");
        
        await _userServicePlanManager.SuspendUserServicePlanAsync(identityUserId, id);
    }

    public async Task ReactivateUserServicePlanAsync(Guid id)
    {
        Guid identityUserId = _currentUser.Id ?? throw new Exception("User is not logged in.");
        
        await _userServicePlanManager.ReactivateUserServicePlanAsync(identityUserId, id);
    }

    public async Task CancelUserServicePlanAsync(Guid id)
    {
        Guid identityUserId = _currentUser.Id ?? throw new Exception("User is not logged in.");
        
        await _userServicePlanManager.CancelUserServicePlanAsync(identityUserId, id);
    }

    #endregion
    
    
}
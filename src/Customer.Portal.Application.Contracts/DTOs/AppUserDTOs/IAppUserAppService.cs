using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Customer.Portal.DTOs.AppUserDTOs;

public interface IAppUserAppService : IApplicationService
{
    public Task<PagedResultDto<AppUserDto>> GetUsers();
    
    public Task<AppUserDto> GetUserByIdAsync(Guid id);
    
    public Task<AppUserDto> GetCurrentAppUserAsync();
    
    public Task<string> GetCurrntUserRoleAsync();
}
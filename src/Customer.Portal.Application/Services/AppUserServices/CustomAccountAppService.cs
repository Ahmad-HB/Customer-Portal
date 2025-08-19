using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Volo.Abp.Account;
using Volo.Abp.Account.Emailing;
using Volo.Abp.Data;
using Volo.Abp.Identity;

namespace Customer.Portal.Services.AppUserServices;

public class CustomAccountAppService : AccountAppService
{
    public CustomAccountAppService(IdentityUserManager userManager, IIdentityRoleRepository roleRepository,
        IAccountEmailer accountEmailer, IdentitySecurityLogManager identitySecurityLogManager,
        IOptions<IdentityOptions> identityOptions) : base(userManager, roleRepository, accountEmailer,
        identitySecurityLogManager, identityOptions)
    {
    }
    
    
    public override async Task<IdentityUserDto> RegisterAsync(RegisterDto input)
    {
        // Call the base registration first
        var userDto = await base.RegisterAsync(input);
        
        // Get the created user
        var user = await UserManager.GetByIdAsync(userDto.Id);
        
        // Set the extended properties on the user entity
        if (input.HasProperty("Name"))
        {
            user.Name = input.GetProperty<string>("Name");
        }
        
        if (input.HasProperty("PhoneNumber"))
        {
            // user.SetProperty("PhoneNumber", input.GetProperty<string>("PhoneNumber"));
            // Also set the standard PhoneNumber property if you want
            // user.PhoneNumber = input.GetProperty<string>("PhoneNumber");
            user.SetPhoneNumber(input.GetProperty<string>("PhoneNumber"), false);
        }
        
        // Update the user
        await UserManager.UpdateAsync(user);
        
        return userDto;
    }
}
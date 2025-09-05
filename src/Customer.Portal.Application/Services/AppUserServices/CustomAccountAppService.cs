using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Volo.Abp.Account;
using Volo.Abp.Account.Emailing;
using Volo.Abp.Data;
using Volo.Abp.Identity;
using Customer.Portal.DTOs.Account;
using Customer.Portal.Enums;
using Volo.Abp;

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
        
        // For normal registration, ensure user gets Customer role (default)
        await AssignRoleBasedOnUserTypeAsync(user, UserType.Customer);
        
        // Update the user
        await UserManager.UpdateAsync(user);
        
        return userDto;
    }
    
    /// <summary>
    /// Register a new user with phone number and name
    /// </summary>
    /// <param name="input">Registration information including phone number and name</param>
    /// <returns>Created user information</returns>
    public virtual async Task<IdentityUserDto> RegisterWithPhoneAsync(RegisterWithPhoneDto input)
    {
        // Convert to base RegisterDto and set properties
        var registerDto = new RegisterDto
        {
            AppName = input.AppName,
            EmailAddress = input.EmailAddress,
            Password = input.Password,
            UserName = input.UserName
        };
        
        registerDto.SetProperty("Name", input.Name);
        registerDto.SetProperty("PhoneNumber", input.PhoneNumber);
        
        return await RegisterAsync(registerDto);
    }
    
    /// <summary>
    /// Admin endpoint to register a new user with specified role/user type
    /// </summary>
    /// <param name="input">Registration information including phone number, name, and user type</param>
    /// <returns>Created user information</returns>
    public virtual async Task<IdentityUserDto> AdminRegisterUserAsync(AdminRegisterUserDto input)
    {
        // Convert to base RegisterDto and set properties
        var registerDto = new RegisterDto
        {
            AppName = input.AppName,
            EmailAddress = input.EmailAddress,
            Password = input.Password,
            UserName = input.UserName
        };
        
        registerDto.SetProperty("Name", input.Name);
        registerDto.SetProperty("PhoneNumber", input.PhoneNumber);
        registerDto.SetProperty("UserType", input.UserType);
        
        // Call the base registration first
        var userDto = await base.RegisterAsync(registerDto);
        
        // Get the created user
        var user = await UserManager.GetByIdAsync(userDto.Id);
        
        // Set the extended properties on the user entity
        if (input.HasProperty("Name"))
        {
            user.Name = input.GetProperty<string>("Name");
        }
        
        if (input.HasProperty("PhoneNumber"))
        {
            user.SetPhoneNumber(input.GetProperty<string>("PhoneNumber"), false);
        }
        
        // Assign role based on user type
        await AssignRoleBasedOnUserTypeAsync(user, input.UserType);
        
        // Update the user
        await UserManager.UpdateAsync(user);
        
        return userDto;
    }
    
    private async Task AssignRoleBasedOnUserTypeAsync(IdentityUser user, UserType userType)
    {
        var roleName = userType switch
        {
            UserType.Admin => "Admin",
            UserType.SupportAgent => "SupportAgent", 
            UserType.Technician => "Technician",
            UserType.Customer => "Customer",
            _ => "Customer" // Default fallback
        };
        
        try
        {
            // Check if user already has the role
            var userRoles = await UserManager.GetRolesAsync(user);
            if (!userRoles.Contains(roleName))
            {
                // Try to assign the role - if it fails, the role might not exist
                await UserManager.AddToRoleAsync(user, roleName);
            }
        }
        catch (Exception)
        {
            // Log the error but don't fail the registration
            // The role might not exist yet, which is handled by the data seeding process
            // For now, we'll just log and continue - the role will be assigned later
        }
    }
}
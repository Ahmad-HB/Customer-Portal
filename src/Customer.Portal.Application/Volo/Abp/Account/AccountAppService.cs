// using System.Threading.Tasks;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.Extensions.Options;
// using Volo.Abp.Account;
// using Volo.Abp.Account.Emailing;
// using Volo.Abp.DependencyInjection;
// using Volo.Abp.Identity;
// using Volo.Abp.ObjectExtending;
//
// namespace Customer.Portal.Volo.Abp.Account;
//
// [Dependency(ReplaceServices = true)]
// [ExposeServices(typeof(IAccountAppService))]
// public class AccountAppService : global::Volo.Abp.Account.AccountAppService, ITransientDependency
// {
//     
//     public AccountAppService(IdentityUserManager userManager, IIdentityRoleRepository roleRepository, IAccountEmailer accountEmailer, IdentitySecurityLogManager identitySecurityLogManager, IOptions<IdentityOptions> identityOptions) : base(userManager, roleRepository, accountEmailer, identitySecurityLogManager, identityOptions)
//     {
//     }
//     
//     
//     public async Task<IdentityUserDto> RegisterAsync(RegisterDto input, string Name, string PhoneNumber)
//     {
//         await CheckSelfRegistrationAsync();
//
//         await IdentityOptions.SetAsync();
//
//         var user = new IdentityUser(GuidGenerator.Create(), input.UserName, input.EmailAddress, CurrentTenant.Id);
//
//         input.MapExtraPropertiesTo(user);
//
//         (await UserManager.CreateAsync(user, input.Password)).CheckErrors();
//
//         await UserManager.SetEmailAsync(user, input.EmailAddress);
//         await UserManager.AddDefaultRolesAsync(user);
//
//         return ObjectMapper.Map<IdentityUser, IdentityUserDto>(user);
//     }
//     
// }

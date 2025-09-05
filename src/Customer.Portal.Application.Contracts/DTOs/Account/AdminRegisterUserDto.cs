using System.ComponentModel.DataAnnotations;
using Customer.Portal.Enums;
using Volo.Abp.Account;
using Volo.Abp.Identity;
using Volo.Abp.Validation;

namespace Customer.Portal.DTOs.Account;

public class AdminRegisterUserDto : RegisterDto
{
    [Required]
    [DynamicStringLength(typeof(IdentityUserConsts), nameof(IdentityUserConsts.MaxNameLength))]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Phone]
    [DynamicStringLength(typeof(IdentityUserConsts), nameof(IdentityUserConsts.MaxPhoneNumberLength))]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public UserType UserType { get; set; }
}

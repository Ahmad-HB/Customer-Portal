// using Volo.Abp.Auditing;
// using Volo.Abp.Identity;
// using Volo.Abp.ObjectExtending;
// using Volo.Abp.Validation;
// using System.ComponentModel.DataAnnotations;
// using Volo.Abp.DependencyInjection;
// using System.Runtime.CompilerServices;
//
// namespace Customer.Portal.Volo.Abp.Account;
//
// public class MyRegisterDto : ExtensibleObject
// {
//     [Required]
//     [DynamicStringLength(typeof(IdentityUserConsts), nameof(IdentityUserConsts.MaxUserNameLength))]
//     public string UserName { get; set; }
//     
//     [Required]
//     [DynamicStringLength(typeof(IdentityUserConsts), nameof(IdentityUserConsts.MaxUserNameLength))]
//     public string Name { get; set; }
//     
//     [Required]
//     [DynamicStringLength(typeof(IdentityUserConsts), nameof(IdentityUserConsts.MaxUserNameLength))]
//     public string PhoneNumber { get; set; }
//
//     [Required]
//     [EmailAddress]
//     [DynamicStringLength(typeof(IdentityUserConsts), nameof(IdentityUserConsts.MaxEmailLength))]
//     public string EmailAddress { get; set; }
//
//     [Required]
//     [DynamicStringLength(typeof(IdentityUserConsts), nameof(IdentityUserConsts.MaxPasswordLength))]
//     [DataType(DataType.Password)]
//     [DisableAuditing]
//     public string Password { get; set; }
//     
//     [Required]
//     public string AppName { get; set; }
// }

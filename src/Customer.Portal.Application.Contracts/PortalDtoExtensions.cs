using System.ComponentModel.DataAnnotations;
using Volo.Abp.Account;
using Volo.Abp.Identity;
using Volo.Abp.ObjectExtending;
using Volo.Abp.Threading;
using Volo.Abp.Validation;

namespace Customer.Portal;

public static class PortalDtoExtensions
{
    private static readonly OneTimeRunner OneTimeRunner = new OneTimeRunner();

    public static void Configure()
    {
        OneTimeRunner.Run(() =>
        {
            /* You can add extension properties to DTOs
             * defined in the depended modules.
             *
             * Example:
             *
             * ObjectExtensionManager.Instance
             *   .AddOrUpdateProperty<IdentityRoleDto, string>("Title");
             *
             * See the documentation for more:
             * https://docs.abp.io/en/abp/latest/Object-Extensions
             */

            // ObjectExtensionManager.Instance
            //     .AddOrUpdateProperty<MyRegisterDto, string>("Name")
            //     .AddOrUpdateProperty<MyRegisterDto, string>("PhoneNumber");

            // ObjectExtensionManager.Instance.AddOrUpdateProperty<string>(
            //     new[] { typeof(MyRegisterDto) },
            //     "MyCustomProperty"
            // );

            //========================================================================================================================                

            ObjectExtensionManager.Instance
                .AddOrUpdateProperty<RegisterDto, string>(
                    "Name",
                    property =>
                    {
                        property.Attributes.Add(new RequiredAttribute());
                        property.Attributes.Add(new DynamicStringLengthAttribute(typeof(IdentityUserConsts),
                            nameof(IdentityUserConsts.MaxNameLength)));
                    })
                .AddOrUpdateProperty<RegisterDto, string>(
                    "PhoneNumber",
                    property =>
                    {
                        property.Attributes.Add(new RequiredAttribute());
                        property.Attributes.Add(new DynamicStringLengthAttribute(typeof(IdentityUserConsts),
                            nameof(IdentityUserConsts.MaxPhoneNumberLength)));
                        // Add phone number validation attribute
                        property.Attributes.Add(new PhoneAttribute());
                    });
        });
    }
}
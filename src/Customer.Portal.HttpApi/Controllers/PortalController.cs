using Customer.Portal.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace Customer.Portal.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class PortalController : AbpControllerBase
{
    protected PortalController()
    {
        LocalizationResource = typeof(PortalResource);
    }
}

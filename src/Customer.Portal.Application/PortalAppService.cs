using Customer.Portal.Localization;
using Volo.Abp.Application.Services;

namespace Customer.Portal;

/* Inherit your application services from this class.
 */
public abstract class PortalAppService : ApplicationService
{
    protected PortalAppService()
    {
        LocalizationResource = typeof(PortalResource);
    }
}

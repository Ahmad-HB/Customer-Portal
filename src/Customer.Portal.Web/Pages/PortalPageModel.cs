using Customer.Portal.Localization;
using Volo.Abp.AspNetCore.Mvc.UI.RazorPages;

namespace Customer.Portal.Web.Pages;

public abstract class PortalPageModel : AbpPageModel
{
    protected PortalPageModel()
    {
        LocalizationResourceType = typeof(PortalResource);
    }
}

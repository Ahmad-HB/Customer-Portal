using Volo.Abp.Ui.Branding;
using Volo.Abp.DependencyInjection;
using Microsoft.Extensions.Localization;
using Customer.Portal.Localization;

namespace Customer.Portal.Web;

[Dependency(ReplaceServices = true)]
public class PortalBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<PortalResource> _localizer;

    public PortalBrandingProvider(IStringLocalizer<PortalResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}

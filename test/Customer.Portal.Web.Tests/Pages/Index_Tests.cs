using System.Threading.Tasks;
using Shouldly;
using Xunit;

namespace Customer.Portal.Pages;

[Collection(PortalTestConsts.CollectionDefinitionName)]
public class Index_Tests : PortalWebTestBase
{
    [Fact]
    public async Task Welcome_Page()
    {
        var response = await GetResponseAsStringAsync("/");
        response.ShouldNotBeNull();
    }
}

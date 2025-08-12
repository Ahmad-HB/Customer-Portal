using Customer.Portal.Samples;
using Xunit;

namespace Customer.Portal.EntityFrameworkCore.Applications;

[Collection(PortalTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<PortalEntityFrameworkCoreTestModule>
{

}

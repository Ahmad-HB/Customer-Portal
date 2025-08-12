using Customer.Portal.Samples;
using Xunit;

namespace Customer.Portal.EntityFrameworkCore.Domains;

[Collection(PortalTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<PortalEntityFrameworkCoreTestModule>
{

}

using Xunit;

namespace Customer.Portal.EntityFrameworkCore;

[CollectionDefinition(PortalTestConsts.CollectionDefinitionName)]
public class PortalEntityFrameworkCoreCollection : ICollectionFixture<PortalEntityFrameworkCoreFixture>
{

}

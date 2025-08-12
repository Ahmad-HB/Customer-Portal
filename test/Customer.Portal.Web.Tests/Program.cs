using Microsoft.AspNetCore.Builder;
using Customer.Portal;
using Volo.Abp.AspNetCore.TestBase;

var builder = WebApplication.CreateBuilder();
builder.Environment.ContentRootPath = GetWebProjectContentRootPathHelper.Get("Customer.Portal.Web.csproj"); 
await builder.RunAbpModuleAsync<PortalWebTestModule>(applicationName: "Customer.Portal.Web");

public partial class Program
{
}

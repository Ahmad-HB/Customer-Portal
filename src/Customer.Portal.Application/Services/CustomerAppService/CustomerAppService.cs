using System.Threading.Tasks;
using Customer.Portal.DTOs.CustomerDto;
using Volo.Abp.Application.Services;

namespace Customer.Portal.Services.CustomerAppService;

public class CustomerAppService : ApplicationService, ICustomerAppService
{
    public Task<string> GetWelcomeMessageAsync()
    {
        return Task.FromResult("Welcome to the Customer Portal API");
    }
}

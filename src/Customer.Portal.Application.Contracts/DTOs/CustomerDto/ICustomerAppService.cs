using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Customer.Portal.DTOs.CustomerDto;

public interface ICustomerAppService : IApplicationService
{
    Task<string> GetWelcomeMessageAsync();
}
